'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Minus, Plus, Trash2, Wand2, ArrowLeft, Loader2, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { predictWaitTime } from '@/app/actions';
import type { PredictWaitTimeOutput } from '@/ai/flows/intelligent-wait-time-prediction';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFirebase, useUser } from '@/firebase';
import { generateTokenNumber } from '@/lib/firebase-helpers';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, itemCount, outletId, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user: authUser } = useUser();
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [prediction, setPrediction] = useState<PredictWaitTimeOutput | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!firestore || !outletId || !authUser) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot place order. User not logged in or outlet not selected.',
      });
      return;
    }
    
    setIsPlacingOrder(true);

    try {
      const tokenNumber = await generateTokenNumber(firestore, outletId);
      
      const orderData = {
        outletId: outletId,
        items: cart.map(cartItem => ({
            menuItem: {
                id: cartItem.menuItem.id,
                name: cartItem.menuItem.name,
                priceInr: cartItem.menuItem.priceInr,
                category: cartItem.menuItem.category,
                description: cartItem.menuItem.description,
                imageId: cartItem.menuItem.imageId,
                isAvailable: cartItem.menuItem.isAvailable,
                outletId: cartItem.menuItem.outletId,
                averagePrepTime: cartItem.menuItem.averagePrepTime,
            },
            quantity: cartItem.quantity,
        })),
        totalAmountInr: cartTotal * 1.05,
        status: 'pending',
        createdAt: serverTimestamp(),
        client: {
          id: authUser.uid,
          fullName: authUser.displayName || 'N/A',
          email: authUser.email || 'N/A',
          phoneNumber: authUser.phoneNumber || 'N/A',
        },
        tokenNumber: tokenNumber,
        orderNumber: `DH-${Date.now()}` // Simple order number
      };

      const ordersRef = collection(firestore, 'orders');
      addDocumentNonBlocking(ordersRef, orderData);
      
      toast({
        title: 'Order Placed!',
        description: `Your token number is ${tokenNumber}.`,
      });

      const eta = prediction?.estimatedWaitTime || Math.floor(15 + Math.random() * 10);
      clearCart();
      router.push(`/order-confirmation?token=${tokenNumber}&eta=${eta}`);

    } catch (error) {
      console.error("Failed to place order:", error);
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: 'There was an issue placing your order. Please try again.',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  const handlePredictWaitTime = async () => {
    if (!outletId || cart.length === 0) return;
    setIsPredicting(true);
    setPredictionError(null);
    setPrediction(null);
    
    const input = {
      outletId,
      itemIds: cart.flatMap(item => Array(item.quantity).fill(item.menuItem.id)),
      orderTime: new Date().toISOString(),
      queueDepth: Math.floor(Math.random() * 10), // Mocked queue depth
    };

    const result = await predictWaitTime(input);
    if(result.success && result.data) {
      setPrediction(result.data);
    } else {
      setPredictionError(result.error || 'An unknown error occurred.');
    }
    
    setIsPredicting(false);
  };


  if (itemCount === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold font-headline">Your Cart is Empty</h1>
        <p className="mt-4 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="mt-8">
          <Link href="/outlets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Outlets
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold font-headline mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {cart.map(({ menuItem, quantity }) => {
                  const image = PlaceHolderImages.find(img => img.id === menuItem.imageId);
                  return (
                    <li key={menuItem.id} className="flex items-center gap-4 p-4">
                      <div className="relative h-20 w-20 rounded-md overflow-hidden">
                        {image && <Image src={image.imageUrl} alt={menuItem.name} fill className="object-cover" data-ai-hint={image.imageHint} />}
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold">{menuItem.name}</p>
                        <p className="text-sm text-muted-foreground">₹{menuItem.priceInr.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(menuItem.id, quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input type="number" value={quantity} readOnly className="h-8 w-12 text-center" />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(menuItem.id, quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(menuItem.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>₹{cartTotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Taxes & Charges</p>
                <p>₹{(cartTotal * 0.05).toFixed(2)}</p>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <p>Grand Total</p>
                <p>₹{(cartTotal * 1.05).toFixed(2)}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Button onClick={handlePredictWaitTime} disabled={isPredicting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isPredicting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Predict Wait Time with AI
                </Button>
                {prediction && (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>AI Prediction: ~{prediction.estimatedWaitTime} minutes</AlertTitle>
                        <AlertDescription className="text-xs">{prediction.reasoning}</AlertDescription>
                    </Alert>
                )}
                {predictionError && (
                    <Alert variant="destructive">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Prediction Failed</AlertTitle>
                        <AlertDescription className="text-xs">{predictionError}</AlertDescription>
                    </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={isPlacingOrder || !authUser}>
                 {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {authUser ? 'Place Order' : 'Login to Place Order'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

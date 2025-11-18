'use client';

import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/back-button';
import { Input } from '@/components/ui/input';
import { useFirebase, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/types';


export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, itemCount, clearCart, outletId } = useCart();
  const router = useRouter();
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();

  
  const handlePlaceOrder = async () => {
    if (!user || !firestore || !outletId) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in and have selected an outlet to place an order.',
      });
      return;
    }
    
    // In a real app, this would involve a more robust order creation process on the backend
    const orderData: Omit<Order, 'id'> = {
      clientId: user.uid,
      outletId: outletId,
      items: JSON.stringify(cart.map(item => ({ id: item.menuItem.id, name: item.menuItem.name, quantity: item.quantity, priceInr: item.menuItem.priceInr }))),
      totalAmountInr: cartTotal * 1.05, // Including 5% tax
      status: 'pending',
      paymentStatus: 'Paid', // Assuming pre-paid
      orderNumber: `DH-${Date.now().toString().slice(-6)}`,
      tokenNumber: Math.floor(100 + Math.random() * 900),
      paymentMethod: 'Wallet', // Mock
      estimatedWaitTime: Math.floor(15 + Math.random() * 10), // This could be more intelligent
      createdAt: serverTimestamp(),
      clientName: user.displayName || user.email || 'Anonymous',
    };
    
    const ordersColRef = collection(firestore, 'users', user.uid, 'orders');
    const orderDoc = await addDocumentNonBlocking(ordersColRef, orderData);

    toast({
      title: 'Order Placed!',
      description: 'Your order has been successfully placed.',
    });
    
    const token = orderData.tokenNumber;
    const eta = orderData.estimatedWaitTime;
    
    clearCart();
    
    router.push(`/order-confirmation?token=${token}&eta=${eta}&orderId=${orderDoc?.id}`);
  };

  if (itemCount === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold font-headline">Your Cart is Empty</h1>
        <p className="mt-4 text-muted-foreground">Looks like you haven&apos;t added anything to your cart yet.</p>
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
      <div className='mb-8'>
        <BackButton />
      </div>
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
                      <div className="relative h-20 w-20 rounded-md overflow-hidden shrink-0">
                        {image ? <Image src={image.imageUrl} alt={menuItem.name} fill className="object-cover" data-ai-hint={image.imageHint} /> : <div className="bg-muted h-full w-full"/>}
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
                <p>Taxes & Charges (5%)</p>
                <p>₹{(cartTotal * 0.05).toFixed(2)}</p>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <p>Grand Total</p>
                <p>₹{(cartTotal * 1.05).toFixed(2)}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={!user}>
                Place Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

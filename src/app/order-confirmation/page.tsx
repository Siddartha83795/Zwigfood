'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle2, Clock } from 'lucide-react';
import { Suspense } from 'react';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '---';
  const eta = searchParams.get('eta') || '--';

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <CardTitle className="mt-4 text-3xl font-bold font-headline">Order Placed Successfully!</CardTitle>
          <CardDescription>Thank you for your order. We're preparing it now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted p-4">
            <p className="text-sm font-medium text-muted-foreground">Your Token Number</p>
            <p className="text-5xl font-bold tracking-tighter">{token}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <p className="font-medium">Estimated Wait Time: <span className="font-bold text-foreground">{eta} minutes</span></p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button asChild className="w-full">
            <Link href="/orders">Track Your Order</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/outlets">Place Another Order</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderConfirmationContent />
        </Suspense>
    )
}

'use client';

import { useState, useEffect } from 'react';
import OrderCard from '@/components/order-card';
import { orders as mockOrders } from '@/lib/data';
import type { Order } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OrdersPage() {
  const [clientOrders, setClientOrders] = useState<Order[]>([]);

  useEffect(() => {
    // For now, we'll just use all mock orders for any client.
    // In a real app, you'd fetch this based on the logged-in user.
    setClientOrders(mockOrders);
  }, []);

  const activeOrders = clientOrders.filter(o => ['pending', 'accepted', 'preparing', 'ready'].includes(o.status));
  const pastOrders = clientOrders.filter(o => ['completed', 'cancelled'].includes(o.status));


  if (!clientOrders.length) {
    return (
       <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold font-headline">You have no orders yet</h1>
        <p className="mt-4 text-muted-foreground">Looks like you haven't placed an order.</p>
        <Button asChild className="mt-8">
          <Link href="/outlets">
            Order Now
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
          Your Orders
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Track your current orders and view your order history.
        </p>
      </div>

       <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="past">Past Orders ({pastOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
            {activeOrders.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {activeOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">You have no active orders.</p>
                </div>
            )}
        </TabsContent>
        <TabsContent value="past">
            {pastOrders.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {pastOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">You have no past orders.</p>
                </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

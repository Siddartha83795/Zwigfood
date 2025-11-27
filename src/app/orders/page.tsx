'use client';

import { useMemo } from 'react';
import OrderCard from '@/components/order-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Order } from '@/lib/types';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function OrdersPage() {
  const { firestore } = useFirebase();
  const { user: authUser, isUserLoading } = useUser();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return query(
        collection(firestore, 'orders'),
        where('client.id', '==', authUser.uid)
    );
  }, [firestore, authUser]);

  const { data: clientOrders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

  const sortedOrders = useMemo(() => {
    if (!clientOrders) return [];
    return [...clientOrders].sort((a, b) => {
        const timeA = (a.createdAt as Timestamp)?.toDate?.() || new Date(0);
        const timeB = (b.createdAt as Timestamp)?.toDate?.() || new Date(0);
        return timeB.getTime() - timeA.getTime();
    });
  }, [clientOrders]);

  const activeOrders = useMemo(() => sortedOrders?.filter(o => ['pending', 'accepted', 'preparing', 'ready'].includes(o.status)) || [], [sortedOrders]);
  const pastOrders = useMemo(() => sortedOrders?.filter(o => ['completed', 'cancelled'].includes(o.status)) || [], [sortedOrders]);

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4 p-4 border rounded-lg">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
                <Separator />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Separator />
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-1/4" />
                </div>
            </div>
        ))}
    </div>
  )


  if (!isUserLoading && !areOrdersLoading && !clientOrders?.length) {
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
          <TabsTrigger value="active">Active Orders ({areOrdersLoading ? '...' : activeOrders.length})</TabsTrigger>
          <TabsTrigger value="past">Past Orders ({areOrdersLoading ? '...' : pastOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
            {areOrdersLoading ? renderSkeletons() : activeOrders.length > 0 ? (
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
             {areOrdersLoading ? renderSkeletons() : pastOrders.length > 0 ? (
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

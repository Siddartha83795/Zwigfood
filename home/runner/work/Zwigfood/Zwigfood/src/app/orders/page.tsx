
'use client';

import OrderCard from '@/components/order-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCollection, useFirebase, useFirestore, useMemoFirebase } from '@/firebase';
import type { Order } from '@/lib/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersPage() {
  const { user, isUserLoading } = useFirebase();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, `users/${user.uid}/orders`),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: clientOrders, isLoading } = useCollection<Order>(ordersQuery);

  if (isLoading || isUserLoading) {
    return <OrdersPageSkeleton />;
  }
  
  if (!user) {
     return (
       <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold font-headline">Please Login</h1>
        <p className="mt-4 text-muted-foreground">You need to be logged in to view your orders.</p>
        <Button asChild className="mt-8">
          <Link href="/auth/login">
            Login
          </Link>
        </Button>
      </div>
    )
  }

  const activeOrders = clientOrders?.filter((o: Order) => ['pending', 'accepted', 'preparing', 'ready'].includes(o.status)) || [];
  const pastOrders = clientOrders?.filter((o: Order) => ['completed', 'cancelled'].includes(o.status)) || [];

  if (!clientOrders || clientOrders.length === 0) {
    return (
       <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold font-headline">No Orders Found</h1>
        <p className="mt-4 text-muted-foreground">You haven't placed any orders yet.</p>
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
                    {activeOrders.map((order: Order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <p>You have no active orders.</p>
                </div>
            )}
        </TabsContent>
        <TabsContent value="past">
            {pastOrders.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {pastOrders.map((order: Order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <p>You have no past orders.</p>
                </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


function OrdersPageSkeleton() {
    return (
         <div className="container py-12">
            <div className="text-center mb-8">
                <Skeleton className="h-12 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
            </div>

            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active Orders</TabsTrigger>
                    <TabsTrigger value="past">Past Orders</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
                    </div>
                </TabsContent>
                <TabsContent value="past">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

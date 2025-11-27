'use client';

import { useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import OrderCard from '@/components/order-card';
import type { Order, Outlet, OrderStatus } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCollection, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type StatusColumn = {
    title: string;
    status: OrderStatus[];
};

const columns: StatusColumn[] = [
    { title: "New Orders", status: ['pending', 'accepted'] },
    { title: "In Preparation", status: ['preparing'] },
    { title: "Ready for Pickup", status: ['ready'] }
];

export default function StaffOutletDashboardPage() {
  const { outletId } = useParams<{ outletId: string }>();
  const { firestore } = useFirebase();

  const outletRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'outlets', outletId);
  }, [firestore, outletId]);
  const { data: outlet, isLoading: isOutletLoading } = useDoc<Outlet>(outletRef);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'orders'),
        where('outletId', '==', outletId),
        orderBy('createdAt', 'asc')
    );
  }, [firestore, outletId]);
  const { data: outletOrders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

  if (!isOutletLoading && !outlet) {
    notFound();
  }
  
  const renderColumnSkeletons = () => (
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {columns.map(col => (
          <div key={col.title} className="bg-card rounded-lg flex flex-col h-full">
            <div className="p-4 border-b">
              <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="p-4 space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-3 p-4 border rounded-lg">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                   <Separator />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                   <Separator />
                  <div className="flex justify-end">
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="container py-6 border-b">
             {isOutletLoading ? (
                <>
                    <Skeleton className="h-8 w-1/3 mb-2"/>
                    <Skeleton className="h-5 w-1/4"/>
                </>
             ) : (
                <>
                    <h1 className="text-3xl font-bold font-headline">Staff Dashboard</h1>
                    <p className="text-muted-foreground">{outlet?.name}</p>
                </>
             )}
        </div>
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
            {areOrdersLoading ? renderColumnSkeletons() : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                    {columns.map(col => {
                        const filteredOrders = outletOrders?.filter(o => col.status.includes(o.status)) || [];
                        return (
                            <div key={col.title} className="bg-card rounded-lg flex flex-col h-full">
                                <h2 className="text-lg font-semibold p-4 border-b font-headline">{col.title} ({filteredOrders.length})</h2>
                                <ScrollArea className="flex-grow p-4">
                                <div className="space-y-4">
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map(order => (
                                            <OrderCard key={order.id} order={order} isStaffView={true} />
                                        ))
                                    ) : (
                                    <div className="text-center text-muted-foreground py-16">
                                        <p>No orders in this category.</p>
                                    </div>
                                    )}
                                </div>
                                </ScrollArea>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    </div>
  );
}

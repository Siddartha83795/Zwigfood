'use client';

import { notFound, useRouter } from 'next/navigation';
import OrderCard from '@/components/order-card';
import type { Order, OrderStatus, Outlet } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirebase, useUser, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useEffect } from 'react';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
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

export default function StaffDashboardPage({ params }: { params: { outletId: string } }) {
  const router = useRouter();
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  const outletRef = useMemoFirebase(() => {
      if(!firestore) return null;
      return doc(firestore, 'outlets', params.outletId);
  }, [firestore, params.outletId]);
  const { data: outlet, isLoading: isOutletLoading } = useDoc<Outlet>(outletRef);
  
  const ordersQuery = useMemoFirebase(() => {
    if(!firestore) return null;
    return query(
        collection(firestore, 'orders'),
        where('outletId', '==', params.outletId),
        where('status', 'in', ['pending', 'accepted', 'preparing', 'ready']),
        orderBy('createdAt', 'asc')
    )
  }, [firestore, params.outletId]);
  const { data: outletOrders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/auth/login');
    }
    // A future improvement would be to check if the user is staff and has access to this specific outlet.
  }, [user, isUserLoading, router]);

  if (!isOutletLoading && !outlet) {
    notFound();
  }

  const renderColumnSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {columns.map(col => (
             <div key={col.title} className="bg-card rounded-lg flex flex-col h-full">
                <h2 className="text-lg font-semibold p-4 border-b font-headline">{col.title}</h2>
                <div className="p-4 space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
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
                 <Skeleton className="h-8 w-1/2 mb-2" />
                 <Skeleton className="h-4 w-1/4" />
                </>
            ) : (
                <>
                 <h1 className="text-3xl font-bold font-headline">Staff Dashboard</h1>
                 <p className="text-muted-foreground">{outlet?.name}</p>
                </>
            )}
            
        </div>
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {areOrdersLoading ? renderColumnSkeletons() : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                    {columns.map(col => (
                        <div key={col.title} className="bg-card rounded-lg flex flex-col h-full">
                            <h2 className="text-lg font-semibold p-4 border-b font-headline">{col.title} ({outletOrders?.filter(o => col.status.includes(o.status)).length || 0})</h2>
                            <ScrollArea className="flex-grow p-4">
                            <div className="space-y-4">
                                {outletOrders?.filter(o => col.status.includes(o.status)).length > 0 ? (
                                    outletOrders
                                        .filter(o => col.status.includes(o.status))
                                        .map(order => (
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
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}

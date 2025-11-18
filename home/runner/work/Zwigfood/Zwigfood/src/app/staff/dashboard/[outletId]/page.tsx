'use client';

import { notFound } from 'next/navigation';
import OrderCard from '@/components/order-card';
import type { Order, OrderStatus, Outlet } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { use, useMemo } from 'react';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, updateDoc, where, getDocs, writeBatch } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';

type StatusColumn = {
    title: string;
    statuses: OrderStatus[];
};

const columns: StatusColumn[] = [
    { title: "New Orders", statuses: ['pending'] },
    { title: "Accepted", statuses: ['accepted'] },
    { title: "In Preparation", statuses: ['preparing'] },
    { title: "Ready for Pickup", statuses: ['ready'] }
];

async function getOrdersByOutlet(firestore: any, outletId: string): Promise<Order[]> {
    const usersCollection = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const allOrders: Order[] = [];
    const batch = writeBatch(firestore);

    for (const userDoc of usersSnapshot.docs) {
        const ordersCollection = collection(firestore, `users/${userDoc.id}/orders`);
        const ordersQuery = query(ordersCollection, where('outletId', '==', outletId));
        const ordersSnapshot = await getDocs(ordersQuery);
        
        ordersSnapshot.forEach(orderDoc => {
            allOrders.push({ id: orderDoc.id, ...orderDoc.data() } as Order);
        });
    }

    await batch.commit().catch(console.error); // Batch might be empty, that's okay
    return allOrders;
}


function StaffDashboardPageContent({ outletId }: { outletId: string }) {
  const firestore = useFirestore();

  const outletRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'outlets', outletId);
  }, [firestore, outletId]);

  const {data: outlet, isLoading: isOutletLoading} = useDoc<Outlet>(outletRef);
  
  // We can't use a hook here because the query is dynamic across all users.
  // This is a simplified approach for this app. A real-world app would use a different data model or backend functions.
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [areOrdersLoading, setAreOrdersLoading] = React.useState(true);

  React.useEffect(() => {
      if (!firestore) return;
      setAreOrdersLoading(true);
      getOrdersByOutlet(firestore, outletId)
        .then(setOrders)
        .finally(() => setAreOrdersLoading(false));

      // This is not real-time, but we can poll for simplicity
      const interval = setInterval(() => {
        getOrdersByOutlet(firestore, outletId).then(setOrders);
      }, 15000); // Poll every 15 seconds

      return () => clearInterval(interval);

  }, [firestore, outletId]);


  if (isOutletLoading) {
    return <StaffDashboardSkeleton />;
  }
  
  if (!outlet) {
    notFound();
  }
  
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus, userId: string) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'users', userId, 'orders', orderId);
    await updateDocumentNonBlocking(orderRef, { status: newStatus });
    // Optimistically update local state
    setOrders(prev => prev.map(o => o.id === orderId ? {...o, status: newStatus} : o));
  };
  
  const getOrdersForColumn = (statuses: OrderStatus[]) => {
      return orders.filter(o => statuses.includes(o.status)).sort((a,b) => ((a.createdAt as any)?.seconds ?? 0) - ((b.createdAt as any)?.seconds ?? 0));
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="container py-6 border-b">
            <h1 className="text-3xl font-bold font-headline">Staff Dashboard</h1>
            <p className="text-muted-foreground">{outlet.name}</p>
        </div>
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
                {columns.map(col => {
                    const columnOrders = getOrdersForColumn(col.statuses);
                    return (
                        <div key={col.title} className="bg-card rounded-lg flex flex-col h-full overflow-hidden">
                            <h2 className="text-lg font-semibold p-4 border-b font-headline">{col.title} ({columnOrders.length})</h2>
                            <ScrollArea className="flex-grow p-4">
                               <div className="space-y-4">
                                 {areOrdersLoading ? <Skeleton className="h-64 w-full" /> : 
                                 columnOrders.length > 0 ? (
                                    columnOrders
                                        .map(order => (
                                            <OrderCard 
                                                key={order.id} 
                                                order={order} 
                                                isStaffView={true}
                                                onStatusChange={(orderId, newStatus) => handleStatusChange(orderId, newStatus, order.clientId)}
                                            />
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
        </div>
    </div>
  );
}


function StaffDashboardSkeleton() {
    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            <div className="container py-6 border-b">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-5 w-1/4 mt-2" />
            </div>
            <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-card rounded-lg flex flex-col h-full overflow-hidden">
                            <div className="p-4 border-b">
                                <Skeleton className="h-6 w-1/2" />
                            </div>
                            <div className="flex-grow p-4 space-y-4">
                                <Skeleton className="h-48 w-full" />
                                <Skeleton className="h-48 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


export default function StaffDashboardPage({ params: paramsPromise }: { params: Promise<{ outletId: string }> }) {
  const params = use(paramsPromise);
  return <StaffDashboardPageContent outletId={params.outletId} />;
}

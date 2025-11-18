
'use client';

import OrderCard from '@/components/order-card';
import type { Order, OrderStatus, Outlet } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useMemo, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { isTimestamp } from '@/lib/utils';


type StatusColumn = {
    title: string;
    statuses: OrderStatus[];
};

const columns: StatusColumn[] = [
    { title: "New Orders", statuses: ['pending', 'accepted'] },
    { title: "In Preparation", statuses: ['preparing'] },
    { title: "Ready for Pickup", statuses: ['ready'] }
];

async function getAllOrders(firestore: any): Promise<Order[]> {
    const usersCollection = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const allOrders: Order[] = [];
    const activeStatuses = ['pending', 'accepted', 'preparing', 'ready'];

    for (const userDoc of usersSnapshot.docs) {
        const ordersCollection = collection(firestore, `users/${userDoc.id}/orders`);
        const ordersQuery = query(ordersCollection, where('status', 'in', activeStatuses));
        const ordersSnapshot = await getDocs(ordersQuery);
        
        ordersSnapshot.forEach(orderDoc => {
            allOrders.push({ id: orderDoc.id, ...orderDoc.data() } as Order);
        });
    }
    return allOrders;
}

export default function ActiveOrdersPage() {
  const firestore = useFirestore();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [areOrdersLoading, setAreOrdersLoading] = useState(true);
  const [selectedOutletId, setSelectedOutletId] = useState<string>('all');

   const outletsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'outlets');
  }, [firestore]);
  const { data: outlets, isLoading: areOutletsLoading } = useCollection<Outlet>(outletsRef);

  useEffect(() => {
    if (!firestore) return;
    setAreOrdersLoading(true);
    getAllOrders(firestore)
        .then(setAllOrders)
        .finally(() => setAreOrdersLoading(false));
     
      const interval = setInterval(() => {
        getAllOrders(firestore).then(setAllOrders);
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(interval);
  }, [firestore]);


  const filteredOrders = useMemo(() => {
    if (selectedOutletId === 'all') {
        return allOrders;
    }
    return allOrders.filter(o => o.outletId === selectedOutletId);
  }, [allOrders, selectedOutletId]);
  
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus, userId: string) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'users', userId, 'orders', orderId);
    await updateDocumentNonBlocking(orderRef, { status: newStatus });
    // Optimistically update local state
    setAllOrders(prev => prev.map(o => o.id === orderId ? {...o, status: newStatus} : o));
  };
  
  const getOrdersForColumn = (statuses: OrderStatus[]) => {
      return filteredOrders.filter(o => statuses.includes(o.status));
  }

  const getSortableDate = (date: object | Date | string): number => {
    if (isTimestamp(date)) return date.toDate().getTime();
    if (date instanceof Date) return date.getTime();
    if (typeof date === 'string') return new Date(date).getTime();
    const seconds = (date as any)?.seconds;
    if(seconds) return new Date(seconds * 1000).getTime();
    return 0;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="container py-6 border-b">
           <div className="flex justify-between items-center">
             <div>
                <h1 className="text-3xl font-bold font-headline">Active Orders</h1>
                <p className="text-muted-foreground">Live view of all ongoing orders.</p>
             </div>
             <div className="w-full max-w-xs">
                { areOutletsLoading ? <Skeleton className="h-10 w-full" /> : (
                    <Select value={selectedOutletId} onValueChange={setSelectedOutletId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by outlet" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Outlets</SelectItem>
                            {outlets?.map(outlet => (
                                <SelectItem key={outlet.id} value={outlet.id}>{outlet.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
             </div>
           </div>
        </div>
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
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
                                        .sort((a, b) => getSortableDate(a.createdAt) - getSortableDate(b.createdAt))
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

    

'use client';

import OrderCard from '@/components/order-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect, useMemo } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, getDocs, query, doc, updateDoc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';


async function getAllOrders(firestore: any): Promise<Order[]> {
    const usersCollection = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const allOrders: Order[] = [];

    for (const userDoc of usersSnapshot.docs) {
        const ordersCollection = collection(firestore, `users/${userDoc.id}/orders`);
        const ordersSnapshot = await getDocs(ordersCollection);
        
        ordersSnapshot.forEach(orderDoc => {
            allOrders.push({ id: orderDoc.id, ...orderDoc.data() } as Order);
        });
    }
    return allOrders;
}


export default function AllOrdersPage() {
  const firestore = useFirestore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

   useEffect(() => {
    if (!firestore) return;
    setIsLoading(true);
    getAllOrders(firestore)
        .then(setOrders)
        .finally(() => setIsLoading(false));
     
      const interval = setInterval(() => {
        getAllOrders(firestore).then(setOrders);
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(interval);
  }, [firestore]);


  const handleStatusChange = async (orderId: string, newStatus: OrderStatus, userId: string) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'users', userId, 'orders', orderId);
    await updateDocumentNonBlocking(orderRef, { status: newStatus });
    // Optimistically update local state
    setOrders(prev => prev.map(o => o.id === orderId ? {...o, status: newStatus} : o));
  };
  
  const filteredOrders = useMemo(() => orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.tokenNumber.toString().includes(searchTerm)
  ), [orders, searchTerm]);

  const activeOrders = filteredOrders.filter(o => ['pending', 'accepted', 'preparing', 'ready'].includes(o.status));
  const pastOrders = filteredOrders.filter(o => ['completed', 'cancelled'].includes(o.status));

  return (
    <div className="container py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
          All Orders
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          View all active and past orders across all outlets.
        </p>
      </div>

       <div className="mb-8 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Order #, Token, or Name..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
       {isLoading ? <Skeleton className="h-96 w-full" /> : (
        <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="past">Past Orders ({pastOrders.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
                {activeOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {activeOrders.map(order => (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                isStaffView={true}
                                onStatusChange={(orderId, newStatus) => handleStatusChange(orderId, newStatus, order.clientId)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <p>No active orders found.</p>
                    </div>
                )}
            </TabsContent>
            <TabsContent value="past">
                {pastOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {pastOrders.map(order => (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                isStaffView={true}
                                onStatusChange={(orderId, newStatus) => handleStatusChange(orderId, newStatus, order.clientId)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <p>No past orders found.</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
       )}
    </div>
  );
}

    
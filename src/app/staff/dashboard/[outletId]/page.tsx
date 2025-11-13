
'use client';

import { notFound } from 'next/navigation';
import { outlets, orders as mockOrdersData } from '@/lib/data';
import OrderCard from '@/components/order-card';
import type { Order, OrderStatus } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useMemo } from 'react';

type StatusColumn = {
    title: string;
    statuses: OrderStatus[];
};

const columns: StatusColumn[] = [
    { title: "New Orders", statuses: ['pending', 'accepted'] },
    { title: "In Preparation", statuses: ['preparing'] },
    { title: "Ready for Pickup", statuses: ['ready'] }
];

export default function StaffDashboardPage({ params }: { params: { outletId: string } }) {
  const outlet = useMemo(() => outlets.find(o => o.id === params.outletId), [params.outletId]);
  const [orders, setOrders] = useState<Order[]>(() => 
    mockOrdersData.filter(o => o.outletId === params.outletId)
  );

  if (!outlet) {
    notFound();
  }
  
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? {...o, status: newStatus} : o));
  };
  
  const getOrdersForColumn = (statuses: OrderStatus[]) => {
      return orders.filter(o => statuses.includes(o.status));
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="container py-6 border-b">
            <h1 className="text-3xl font-bold font-headline">Staff Dashboard</h1>
            <p className="text-muted-foreground">{outlet.name}</p>
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
                                 {columnOrders.length > 0 ? (
                                    columnOrders
                                        .map(order => (
                                            <OrderCard 
                                                key={order.id} 
                                                order={order} 
                                                isStaffView={true}
                                                onStatusChange={handleStatusChange}
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

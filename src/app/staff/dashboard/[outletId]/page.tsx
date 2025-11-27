'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { orders as mockOrders, outlets as mockOutlets } from '@/lib/data';
import OrderCard from '@/components/order-card';
import type { Order, Outlet, OrderStatus } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [outlet, setOutlet] = useState<Outlet | undefined>(undefined);
  const [outletOrders, setOutletOrders] = useState<Order[]>([]);

  useEffect(() => {
    const currentOutlet = mockOutlets.find(o => o.id === outletId);
    if(currentOutlet) {
      setOutlet(currentOutlet);
      setOutletOrders(mockOrders.filter(o => o.outletId === outletId));
    }
  }, [outletId]);

  if (!outlet) {
    return notFound();
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="container py-6 border-b">
            <h1 className="text-3xl font-bold font-headline">Staff Dashboard</h1>
            <p className="text-muted-foreground">{outlet.name}</p>
        </div>
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                {columns.map(col => (
                    <div key={col.title} className="bg-card rounded-lg flex flex-col h-full">
                        <h2 className="text-lg font-semibold p-4 border-b font-headline">{col.title} ({outletOrders.filter(o => col.status.includes(o.status)).length})</h2>
                        <ScrollArea className="flex-grow p-4">
                           <div className="space-y-4">
                            {outletOrders.filter(o => col.status.includes(o.status)).length > 0 ? (
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
        </div>
    </div>
  );
}

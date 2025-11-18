
'use client';

import type { Order, OrderStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Tag, Hash, Utensils, User, Check, UtensilsCrossed, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Outlet } from '@/lib/types';
import { useMemo } from 'react';

type OrderCardProps = {
  order: Order;
  isStaffView?: boolean;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
};

const statusVariants = cva('capitalize', {
    variants: {
      status: {
        pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40',
        accepted: 'bg-blue-500/20 text-blue-500 border-blue-500/40',
        preparing: 'bg-primary/20 text-primary border-primary/40',
        ready: 'bg-green-500/20 text-green-500 border-green-500/40',
        completed: 'bg-gray-500/20 text-gray-500 border-gray-500/40',
        cancelled: 'bg-destructive/20 text-destructive border-destructive/40',
      },
    },
    defaultVariants: {
      status: 'pending',
    },
});

function isTimestamp(value: any): value is { toDate: () => Date } {
    return value && typeof value.toDate === 'function';
}

export default function OrderCard({ order, isStaffView = false, onStatusChange }: OrderCardProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const outletsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'outlets');
  }, [firestore]);
  const { data: outlets } = useCollection<Outlet>(outletsRef);

  const outlet = outlets?.find(o => o.id === order.outletId);
  
  const createdAtDate = useMemo(() => {
    if (!order.createdAt) return new Date();
    
    if (isTimestamp(order.createdAt)) {
      return order.createdAt.toDate();
    }
    if (typeof order.createdAt === 'string') {
        return new Date(order.createdAt);
    }
    // Fallback for seconds/nanos structure from older data if any
    const seconds = (order.createdAt as any).seconds || (order.createdAt as any)._seconds;
    if(seconds) {
        return new Date(seconds * 1000);
    }
    return new Date();
  }, [order.createdAt]);


  const timeAgo = Math.round((new Date().getTime() - createdAtDate.getTime()) / (1000 * 60));

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    if (onStatusChange) {
        onStatusChange(order.id, newStatus);
    }
    toast({
        title: "Order Updated",
        description: `Order #${order.tokenNumber} is now ${newStatus}.`
    })
  };

  const statusActions: { [key in OrderStatus]?: { nextStatus: OrderStatus; label: string, icon: React.ReactNode } } = {
    pending: { nextStatus: 'accepted', label: 'Accept', icon: <Check /> },
    accepted: { nextStatus: 'preparing', label: 'Start Preparing', icon: <UtensilsCrossed /> },
    preparing: { nextStatus: 'ready', label: 'Ready for Pickup', icon: <PartyPopper /> },
  };

  const parsedItems = useMemo(() => {
    try {
        if(typeof order.items === 'string') {
            return JSON.parse(order.items);
        }
        return []; // Should not happen if data is consistent
    } catch(e) {
        console.error("Failed to parse order items:", e);
        return [];
    }
  }, [order.items]);


  return (
    <Card className="h-full flex flex-col group transition-all hover:border-primary">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    {order.orderNumber}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                    <Hash className="h-4 w-4" />
                    Token {order.tokenNumber}
                </CardDescription>
            </div>
          <Badge variant="outline" className={cn(statusVariants({ status: order.status }))}>
            {order.status}
          </Badge>
        </div>
        {isStaffView ? (
           <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground truncate">
             <User className="h-4 w-4 shrink-0" /> <span className="truncate" title={order.clientName}>{order.clientName}</span>
           </div>
        ) : outlet && (
            <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                <Utensils className="h-4 w-4" /> {outlet.name}
            </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
         <ul className="text-sm space-y-1">
            {parsedItems.map((item: any) => (
                <li key={item.id} className="flex justify-between">
                    <span className="truncate pr-2">{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                    <span className="font-mono">₹{(item.priceInr * item.quantity).toFixed(2)}</span>
                </li>
            ))}
        </ul>
        <Separator />
        <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="font-mono">₹{order.totalAmountInr.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4 text-xs text-muted-foreground">
        <div className='flex justify-between w-full'>
            <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{timeAgo} mins ago</span>
            </div>
            {!isStaffView && <p>ETA: ~{order.estimatedWaitTime} mins</p>}
        </div>
        {isStaffView && statusActions[order.status] && (
            <Button size="sm" onClick={() => handleStatusUpdate(statusActions[order.status]!.nextStatus)}>
                 {statusActions[order.status]!.icon}
                {statusActions[order.status]!.label}
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

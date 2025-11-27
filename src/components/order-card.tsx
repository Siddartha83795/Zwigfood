'use client';

import type { Order, OrderStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Tag, Utensils, User, Phone, Mail, ChevronRight, Check } from 'lucide-react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import type { Outlet } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button';

type OrderCardProps = {
  order: Order;
  isStaffView?: boolean;
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

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  pending: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  completed: null,
  cancelled: null,
}

export default function OrderCard({ order, isStaffView = false }: OrderCardProps) {
  const { firestore } = useFirebase();
  const outletsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'outlets') : null, [firestore]);
  const { data: outlets } = useCollection<Outlet>(outletsQuery);
  const outlet = outlets?.find(o => o.id === order.outletId);

  // Time calculation can be tricky with server vs client time.
  // We'll use client time for simplicity.
  const createdAt = new Date(typeof order.createdAt === 'string' ? order.createdAt : order.createdAt.toDate());
  const timeAgo = Math.round((new Date().getTime() - createdAt.getTime()) / (1000 * 60));

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'orders', order.id);
    await updateDoc(orderRef, { status: newStatus });
  };

  const nextAction = nextStatus[order.status];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    {order.orderNumber}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                    Token {order.tokenNumber}
                </CardDescription>
            </div>
          <Badge variant="outline" className={cn(statusVariants({ status: order.status }))}>
            {order.status}
          </Badge>
        </div>
        {isStaffView && order.client ? (
           <div className="pt-2 text-sm text-muted-foreground space-y-1">
            <div className='flex items-center gap-2'><User className="h-4 w-4" /> <span>{order.client.fullName}</span></div>
            <div className='flex items-center gap-2'><Mail className="h-4 w-4" /> <span>{order.client.email}</span></div>
            <div className='flex items-center gap-2'><Phone className="h-4 w-4" /> <span>{order.client.phoneNumber}</span></div>
           </div>
        ) : outlet && (
            <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                <Utensils className="h-4 w-4" /> {outlet.name}
            </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <ul className="text-sm space-y-1">
            {order.items.map(item => (
                <li key={item.menuItem.id} className="flex justify-between">
                    <span>{item.menuItem.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                    <span>₹{(item.menuItem.priceInr * item.quantity).toFixed(2)}</span>
                </li>
            ))}
        </ul>
        <Separator />
        <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹{order.totalAmountInr.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex justify-between items-center">
        <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{timeAgo} mins ago</span>
        </div>
        {isStaffView && nextAction ? (
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  Update Status <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleStatusUpdate(nextAction)}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark as {nextAction}
                </DropdownMenuItem>
                 <DropdownMenuItem className="text-destructive" onClick={() => handleStatusUpdate('cancelled')}>
                  Cancel Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        ) : !isStaffView && (
            <p>ETA: ~{order.estimatedWaitTime} mins</p>
        )}
      </CardFooter>
    </Card>
  );
}

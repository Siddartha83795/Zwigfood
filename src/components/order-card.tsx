'use client';

import type { Order, OrderStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Tag, Utensils, User, Phone, Mail, ChevronRight, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { useCollection, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button';
import { doc, Timestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from './ui/skeleton';

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

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'completed',
}

export default function OrderCard({ order, isStaffView = false }: OrderCardProps) {
  const { firestore } = useFirebase();

  const outletRef = useMemoFirebase(() => {
    if (!firestore || !order.outletId) return null;
    return doc(firestore, 'outlets', order.outletId);
  }, [firestore, order.outletId]);
  const { data: outlet, isLoading: isOutletLoading } = useDoc(outletRef);
  

  const createdAt = (order.createdAt as unknown as Timestamp)?.toDate() || new Date();
  const timeAgo = Math.round((new Date().getTime() - createdAt.getTime()) / (1000 * 60));

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'orders', order.id);
    updateDocumentNonBlocking(orderRef, { status: newStatus });
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
        ) : isOutletLoading ? (
           <Skeleton className="h-5 w-32 mt-2" />
        ): outlet && (
            <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                <Utensils className="h-4 w-4" /> {outlet.name}
            </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <ul className="text-sm space-y-1">
            {order.items.map((item, index) => (
                <li key={`${item.menuItem.id}-${index}`} className="flex justify-between">
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
        {isStaffView && order.status !== 'completed' && order.status !== 'cancelled' ? (
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  Update Status <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {nextAction && (
                    <DropdownMenuItem onClick={() => handleStatusUpdate(nextAction)}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark as {nextAction}
                    </DropdownMenuItem>
                )}
                 <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleStatusUpdate('cancelled')}>
                    <X className="h-4 w-4 mr-2" />
                  Cancel Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        ) : !isStaffView && (
            <p>ETA: ~{order.estimatedWaitTime || 20} mins</p>
        )}
      </CardFooter>
    </Card>
  );
}


'use client';

import OutletCard from '@/components/outlet-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Outlet } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function OutletsPage() {
  const firestore = useFirestore();
  const outletsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'outlets');
  }, [firestore]);
  
  const { data: outlets, isLoading } = useCollection<Outlet>(outletsRef);

  return (
    <div className="container py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
          Choose an Outlet
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Select a cafeteria to view the menu and place your order.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
        {outlets?.map((outlet: Outlet) => (
          <OutletCard key={outlet.id} outlet={outlet} />
        ))}
      </div>
    </div>
  );
}

'use client';

import OutletCard from '@/components/outlet-card';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Outlet } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function OutletsPage() {
  const { firestore } = useFirebase();

  const outletsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'outlets');
  }, [firestore]);

  const { data: outlets, isLoading } = useCollection<Outlet>(outletsQuery);

  const renderSkeletons = () => (
    Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <div className="space-y-2 p-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))
  );

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
        {isLoading && renderSkeletons()}
        {outlets && outlets.map((outlet) => (
          <OutletCard key={outlet.id} outlet={outlet} />
        ))}
      </div>
    </div>
  );
}

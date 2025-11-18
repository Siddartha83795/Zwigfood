'use client';

import { useMemo, use } from 'react';
import { notFound } from 'next/navigation';
import MenuItemCard from '@/components/menu-item-card';
import { useCart } from '@/context/cart-context';
import CartWidget from '@/components/cart-widget';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import BackButton from '@/components/back-button';
import { useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Outlet, MenuItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function MenuPageContent({ outletId }: { outletId: string }) {
  const firestore = useFirestore();
  const { setOutletId } = useCart();

  const outletRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'outlets', outletId);
  }, [firestore, outletId]);
  
  const { data: outlet, isLoading: isOutletLoading } = useDoc<Outlet>(outletRef);

  const menuItemsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'outlets', outletId, 'menu_items');
  }, [firestore, outletId]);

  const { data: menuItems, isLoading: areMenuItemsLoading } = useCollection<MenuItem>(menuItemsRef);

  useMemo(() => {
    if (outlet) {
      setOutletId(outlet.id);
    }
  }, [outlet, setOutletId]);

  if (isOutletLoading) {
    return <MenuPageSkeleton />;
  }

  if (!outlet) {
    notFound();
  }
  
  const outletImage = PlaceHolderImages.find(img => img.id === outlet.imageId);

  const categories = menuItems ? [...new Set(menuItems.map(item => item.category))] : [];

  return (
    <>
      <div className="relative h-64 md:h-80 w-full">
        {outletImage && (
          <Image
            src={outletImage.imageUrl}
            alt={outlet.name}
            fill
            className="object-cover"
            data-ai-hint={outletImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute top-20 left-4 md:left-8">
            <BackButton />
        </div>
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
            <div className="container">
                <h1 className="text-4xl md:text-6xl font-bold font-headline text-foreground">{outlet.name}</h1>
                <p className="mt-2 text-lg text-muted-foreground">{outlet.description}</p>
            </div>
        </div>
      </div>
      <div className="container py-12">
        {areMenuItemsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
            </div>
        ) : (
            categories.map(category => (
            <div key={category} className="mb-12">
                <h2 className="text-3xl font-bold font-headline mb-6">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {menuItems && menuItems
                    .filter(item => item.category === category)
                    .map(item => (
                    <MenuItemCard key={item.id} item={item} />
                    ))}
                </div>
            </div>
            ))
        )}
      </div>
      <CartWidget />
    </>
  );
}

function MenuPageSkeleton() {
    return (
        <>
            <div className="relative h-64 md:h-80 w-full">
                <Skeleton className="h-full w-full" />
                <div className="absolute top-20 left-4 md:left-8">
                    <BackButton />
                </div>
                <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
                    <div className="container">
                        <Skeleton className="h-16 w-1/2" />
                        <Skeleton className="h-6 w-3/4 mt-2" />
                    </div>
                </div>
            </div>
            <div className="container py-12">
                <Skeleton className="h-10 w-1/4 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                </div>
            </div>
        </>
    )
}

export default function MenuPage({ params: paramsPromise }: { params: Promise<{ outletId: string }> }) {
  const params = use(paramsPromise);
  return <MenuPageContent outletId={params.outletId} />;
}

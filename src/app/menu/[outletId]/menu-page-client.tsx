'use client';

import { useEffect, useMemo } from 'react';
import { notFound } from 'next/navigation';
import MenuItemCard from '@/components/menu-item-card';
import { useCart } from '@/context/cart-context';
import CartWidget from '@/components/cart-widget';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { MenuItem, Outlet } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function MenuPageClient({ outletId }: { outletId: string }) {
  const { setOutletId } = useCart();
  const { firestore } = useFirebase();

  const outletRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'outlets', outletId);
  }, [firestore, outletId]);
  const { data: outlet, isLoading: isOutletLoading } = useDoc<Outlet>(outletRef);
  
  const menuItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'menu_items'), where('outletId', '==', outletId));
  }, [firestore, outletId]);
  const { data: menuItems, isLoading: areMenuItemsLoading } = useCollection<MenuItem>(menuItemsQuery);

  useEffect(() => {
    if (outlet) {
      setOutletId(outlet.id);
    }
  }, [outlet, setOutletId]);

  if (!isOutletLoading && !outlet) {
    notFound();
  }
  
  const outletImage = PlaceHolderImages.find(img => img.id === outlet?.imageId);
  const categories = menuItems ? [...new Set(menuItems.map(item => item.category))] : [];

  const renderMenuSkeletons = () => (
    <>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="mb-12">
          <Skeleton className="h-8 w-1/3 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, j) => (
               <div key={j} className="space-y-2">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <>
      <div className="relative h-64 md:h-80 w-full">
        {isOutletLoading ? (
            <Skeleton className="h-full w-full" />
        ) : outletImage && (
          <Image
            src={outletImage.imageUrl}
            alt={outletImage.description}
            fill
            className="object-cover"
            data-ai-hint={outletImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
            <div className="container">
              {isOutletLoading ? (
                <>
                  <Skeleton className="h-14 w-1/2 mb-2" />
                  <Skeleton className="h-6 w-3/4" />
                </>
              ) : (
                <>
                  <h1 className="text-4xl md:text-6xl font-bold font-headline text-foreground">{outlet?.name}</h1>
                  <p className="mt-2 text-lg text-muted-foreground">{outlet?.description}</p>
                </>
              )}
            </div>
        </div>
      </div>
      <div className="container py-12">
        {areMenuItemsLoading ? renderMenuSkeletons() : (
          categories.map(category => (
            <div key={category} className="mb-12">
              <h2 className="text-3xl font-bold font-headline mb-6">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {menuItems
                  ?.filter(item => item.category === category)
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

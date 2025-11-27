'use client';

import { useEffect, useMemo } from 'react';
import { notFound } from 'next/navigation';
import { outlets, menuItems as allMenuItems } from '@/lib/data';
import MenuItemCard from '@/components/menu-item-card';
import { useCart } from '@/context/cart-context';
import CartWidget from '@/components/cart-widget';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function MenuPageClient({ outletId }: { outletId: string }) {
  const { setOutletId } = useCart();
  const outlet = useMemo(() => outlets.find(o => o.id === outletId), [outletId]);
  
  useEffect(() => {
    if(outlet) {
      setOutletId(outlet.id);
    }
  }, [outlet, setOutletId]);

  if (!outlet) {
    notFound();
  }
  
  const outletImage = PlaceHolderImages.find(img => img.id === outlet.imageId);

  const menuItems = allMenuItems.filter(item => item.outletId === outlet.id);
  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <>
      <div className="relative h-64 md:h-80 w-full">
        {outletImage && (
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
                <h1 className="text-4xl md:text-6xl font-bold font-headline text-foreground">{outlet.name}</h1>
                <p className="mt-2 text-lg text-muted-foreground">{outlet.description}</p>
            </div>
        </div>
      </div>
      <div className="container py-12">
        {categories.map(category => (
          <div key={category} className="mb-12">
            <h2 className="text-3xl font-bold font-headline mb-6">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {menuItems
                .filter(item => item.category === category)
                .map(item => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
            </div>
          </div>
        ))}
      </div>
      <CartWidget />
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import OutletCard from '@/components/outlet-card';
import { outlets as mockOutlets } from '@/lib/data';
import type { Outlet } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching data
    setOutlets(mockOutlets);
    const handlePopState = () => {
      // Clear login status and redirect
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      router.push('/auth/login');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

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
        {outlets.map((outlet) => (
          <OutletCard key={outlet.id} outlet={outlet} />
        ))}
      </div>
    </div>
  );
}

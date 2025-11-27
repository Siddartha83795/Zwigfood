'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { outlets } from '@/lib/data';
import OutletCard from '@/components/outlet-card';

export default function OutletsPage() {
  const router = useRouter();

  useEffect(() => {
    // This function will be called when the component unmounts (i.e., when the user navigates away)
    return () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn');
        // You can optionally redirect them to the login page upon logout
        // router.push('/auth/login');
        console.log('User logged out upon leaving outlets page.');
      }
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

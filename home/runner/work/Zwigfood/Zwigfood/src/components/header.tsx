'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UtensilsCrossed, User, ShoppingCart, LogOut, LayoutDashboard, Building } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth, useCollection, useFirebase, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import type { Outlet } from '@/lib/types';
import { collection } from 'firebase/firestore';


const clientNavLinks = [
  { href: '/outlets', label: 'Outlets' },
  { href: '/orders', label: 'My Orders' },
];

const staffNavLinks = [
    { href: '/staff/orders/active', label: 'Active Orders' },
    { href: '/staff/orders/all', label: 'All Orders' },
];


export default function Header() {
  const { itemCount } = useCart();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const outletsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'outlets');
  }, [firestore]);
  const { data: outlets } = useCollection<Outlet>(outletsRef);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/auth/login');
  };

  const navLinks = user?.isAnonymous ? staffNavLinks : clientNavLinks;
  
  if (isUserLoading) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                 <div className="mr-auto flex items-center">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <UtensilsCrossed className="h-6 w-6 text-primary" />
                        <span className="font-bold font-headline tracking-wide sm:inline-block">DineHub</span>
                    </Link>
                </div>
                 <div className="flex flex-1 items-center justify-end gap-2">
                    <div className="h-10 w-10" />
                    <div className="h-10 w-24" />
                 </div>
            </div>
        </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline tracking-wide sm:inline-block">
              DineHub
            </span>
          </Link>
           {user && (
              <nav className="hidden gap-6 md:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
           )}
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
           <ThemeToggle />
           
          {user && !user.isAnonymous && (
            <Button asChild variant="ghost" size="icon" className="relative">
                <Link href="/cart">
                    <ShoppingCart className="h-5 w-5"/>
                    {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {itemCount}
                        </span>
                    )}
                    <span className="sr-only">View Cart</span>
                </Link>
            </Button>
          )}

          {user ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5"/>
                    <span className="sr-only">Profile</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!user.isAnonymous && (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/orders"><LayoutDashboard className="mr-2 h-4 w-4" />My Orders</Link>
                        </DropdownMenuItem>
                    </>
                  )}
                  {user.isAnonymous && outlets && (
                     <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                           <Building className="mr-2 h-4 w-4" />
                           <span>Dashboards</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                           {outlets.map(outlet => (
                             <DropdownMenuItem key={outlet.id} asChild>
                               <Link href={`/staff/dashboard/${outlet.id}`}>{outlet.name}</Link>
                             </DropdownMenuItem>
                           ))}
                        </DropdownMenuSubContent>
                     </DropdownMenuSub>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : (
            <Button asChild variant="default" className='hidden md:inline-flex'>
              <Link href="/auth/login">
                Login
              </Link>
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium mt-8">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <UtensilsCrossed className="h-6 w-6 text-primary" />
                  <span className="font-headline">DineHub</span>
                </Link>
                {user && navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                 {!user && <Link
                    href={'/auth/login'}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Login
                  </Link>}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

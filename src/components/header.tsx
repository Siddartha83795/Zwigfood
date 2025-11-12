
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UtensilsCrossed, User } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { ShoppingCart } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

const navLinks = [
  { href: '/outlets', label: 'Outlets' },
  { href: '/orders', label: 'My Orders' },
];

export default function Header() {
  const { itemCount } = useCart();
  const isLoggedIn = false; // Replace with actual auth state
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline tracking-wide sm:inline-block">
            DineHub
          </span>
        </Link>
        <nav className="hidden gap-6 md:flex flex-1">
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
        <div className="flex flex-1 items-center justify-end gap-2">
           <ThemeToggle />
          <Button asChild variant="ghost" size="icon">
              <Link href="/cart">
                  <ShoppingCart className="h-5 w-5"/>
                  {itemCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {itemCount}
                      </span>
                  )}
                  <span className="sr-only">View Cart</span>
              </Link>
          </Button>

          {isLoggedIn ? (
             <Button asChild variant="ghost" size="icon">
              <Link href="/profile">
                  <User className="h-5 w-5"/>
                  <span className="sr-only">Profile</span>
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" className='hidden md:inline-flex'>
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
                {[...navLinks, { href: '/auth/login', label: 'Login' }].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

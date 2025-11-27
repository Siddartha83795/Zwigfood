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
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UtensilsCrossed, User, ShoppingCart, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { ThemeToggle } from './theme-toggle';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navLinks = [
  { href: '/outlets', label: 'Outlets' },
  { href: '/orders', label: 'My Orders' },
];

export default function Header() {
  const { itemCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check login status from localStorage on mount
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    const storedRole = localStorage.getItem('userRole');
    const storedUsername = localStorage.getItem('username');
    setIsLoggedIn(loggedInStatus);
    setUserRole(storedRole);
    setUsername(storedUsername);
  }, [pathname]); // Re-check on path change

  const handleLogout = () => {
    // Clear login status from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUserRole(null);
    setUsername(null);
    router.push('/auth/login');
  };
  
  const showNavLinks = isLoggedIn && userRole === 'client' && !pathname.startsWith('/staff') && pathname !== '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline tracking-wide sm:inline-block">
            DineHub
          </span>
        </Link>
        {showNavLinks && (
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
        )}
        <div className="flex flex-1 items-center justify-end gap-2">
           <ThemeToggle />
           {isLoggedIn && userRole === 'client' && (
            <Button asChild variant="ghost" size="icon" className="relative">
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
           )}

          {isLoggedIn ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <User className="h-5 w-5 mr-2"/>
                    <span>Welcome, {username || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userRole === 'client' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders"><LayoutDashboard className="mr-2 h-4 w-4" />My Orders</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                   {userRole === 'staff' && (
                    <DropdownMenuItem asChild>
                      <Link href="/outlets"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
                    </DropdownMenuItem>
                   )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : (
            pathname !== '/' && (
              <Button asChild variant="default" className='hidden md:inline-flex'>
                <Link href="/auth/login">
                  Login
                </Link>
              </Button>
            )
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
                {showNavLinks && navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                 {!isLoggedIn && (
                   <Link
                      href={'/auth/login'}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Login
                    </Link>
                  )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

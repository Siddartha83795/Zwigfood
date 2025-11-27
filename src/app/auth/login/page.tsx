'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { mockUserProfile, mockStaffProfile, mockAnmolProfile } from '@/lib/data';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        mode: 'onTouched',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit: SubmitHandler<LoginFormValues> = (data) => {
        setIsSubmitting(true);
        // Simulate an API call
        setTimeout(() => {
            if (data.email === mockUserProfile.email && data.password === "password123") {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', 'client');
                localStorage.setItem('username', mockUserProfile.fullName);
                toast({
                    title: "Login Successful",
                    description: `Welcome back, ${mockUserProfile.fullName}!`,
                });
                router.push('/outlets');
            } else if (data.email === mockStaffProfile.email && data.password === "staffpass") {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', 'staff');
                localStorage.setItem('username', mockStaffProfile.fullName);
                toast({
                    title: "Staff Login Successful",
                    description: `Welcome, ${mockStaffProfile.fullName}!`,
                });
                router.push('/outlets');
            } else if (data.email === mockAnmolProfile.email && data.password === "password123") {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', 'client');
                localStorage.setItem('username', mockAnmolProfile.fullName);
                toast({
                    title: "Login Successful",
                    description: `Welcome back, ${mockAnmolProfile.fullName}!`,
                });
                router.push('/outlets');
            } else {
                toast({
                    variant: 'destructive',
                    title: "Login Failed",
                    description: "Invalid email or password.",
                });
            }
            setIsSubmitting(false);
        }, 1500);
    };

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} className="pl-10" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10"/>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-sm">
              Don't have an account?{' '}
              <Link href="/auth/sign-up" className="underline">
                Sign up
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

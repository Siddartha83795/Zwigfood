'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, KeyRound, User, Phone, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { outlets } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/firebase';
import {
  initiateEmailSignIn,
  initiateEmailSignUp,
  initiateAnonymousSignIn
} from '@/firebase/non-blocking-login';

const clientSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
type ClientFormValues = z.infer<typeof clientSchema>;

const staffSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});
type StaffFormValues = z.infer<typeof staffSchema>;

export default function LoginPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [selectedOutlet, setSelectedOutlet] = useState(outlets[0].id);
    const auth = useAuth();

    const clientForm = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        mode: 'onTouched',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const staffForm = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            username: 'admin',
            password: 'admin123',
        },
    });

    const onClientLogin: SubmitHandler<ClientFormValues> = (data) => {
        initiateEmailSignIn(auth, data.email, data.password);
        toast({
            title: "Logging In...",
            description: "Please wait while we sign you in.",
        });
        router.push('/outlets');
    };
    
    const onClientSignUp: SubmitHandler<ClientFormValues> = (data) => {
        initiateEmailSignUp(auth, data.email, data.password);
        toast({
            title: "Creating Account...",
            description: "Please wait while we create your account.",
        });
        router.push('/outlets');
    };

    const onStaffSubmit: SubmitHandler<StaffFormValues> = (data) => {
        if (data.username === 'admin' && data.password === 'admin123') {
            initiateAnonymousSignIn(auth);
            toast({
                title: "Staff Login Successful",
                description: "Redirecting to dashboard...",
            });
            router.push(`/staff/dashboard/${selectedOutlet}`);
        } else {
            toast({
                variant: 'destructive',
                title: "Login Failed",
                description: "Invalid username or password.",
            });
        }
    };

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Tabs defaultValue="client" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="client">Client</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        {/* Client Login Tab */}
        <TabsContent value="client">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">Client Login</CardTitle>
              <CardDescription>Enter your credentials to sign in or sign up.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...clientForm}>
                <form onSubmit={clientForm.handleSubmit(onClientLogin)} className="space-y-4">
                  <FormField
                    control={clientForm.control}
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
                    control={clientForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                         <div className="relative">
                           <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input type="password" {...field} className="pl-10" />
                          </FormControl>
                        </div>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" className="w-full" disabled={!clientForm.formState.isValid}>
                      Login
                    </Button>
                     <Button type="button" variant="secondary" className="w-full" onClick={clientForm.handleSubmit(onClientSignUp)} disabled={!clientForm.formState.isValid}>
                      Sign Up
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Login Tab */}
        <TabsContent value="staff">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">Staff Login</CardTitle>
              <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...staffForm}>
                <form onSubmit={staffForm.handleSubmit(onStaffSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="outlet">Select Outlet</Label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Select value={selectedOutlet} onValueChange={setSelectedOutlet}>
                            <SelectTrigger className="pl-10">
                                <SelectValue placeholder="Select an outlet" />
                            </SelectTrigger>
                            <SelectContent>
                                {outlets.map(outlet => (
                                    <SelectItem key={outlet.id} value={outlet.id}>{outlet.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                  </div>
                  <FormField
                    control={staffForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <div className="relative">
                           <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <FormControl>
                            <Input placeholder="admin" {...field} className="pl-10"/>
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={staffForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                           <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <FormControl>
                            <Input type="password" {...field} className="pl-10"/>
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <p className="text-xs text-center text-muted-foreground pt-4">
                        Login will redirect to the selected outlet&apos;s dashboard.
                    </p>
                  <Button type="submit" className="w-full">
                    Login as Staff
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

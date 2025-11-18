
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import BackButton from '@/components/back-button';
import { useDoc, useFirebase, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().regex(/^\+91\d{10}$/, { message: "Phone number must be in the format +91XXXXXXXXXX." }),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isUserLoading } = useFirebase();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: userProfile?.name || '',
      email: userProfile?.email || user?.email || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
    },
    mode: 'onTouched'
  });

  useEffect(() => {
    form.reset({
      name: userProfile?.name || '',
      email: userProfile?.email || user?.email || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
    });
  }, [userProfile, user, form]);

  function onSubmit(data: ProfileFormValues) {
    if (!userProfileRef || !user) return;
    
    const updatedProfile = { 
        id: user.uid,
        ...data, 
        isProfileComplete: true 
    };
    
    setDocumentNonBlocking(userProfileRef, updatedProfile, { merge: true });

    toast({
      title: "Profile Updated",
      description: "Your information has been saved successfully.",
    });
    router.push('/outlets');
  }

  if(isUserLoading || isProfileLoading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="container py-12">
        <div className="mb-8">
            <BackButton />
        </div>
       <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
                Complete Your Profile
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
                This information is required before you can place an order.
            </p>
        </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Your Details</CardTitle>
          <CardDescription>Please fill out your details. This information will be shared with the staff when you place an order.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input placeholder="Your Name" {...field} className="pl-10" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                     <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} disabled className="pl-10" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                     <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="tel" placeholder="+919876543210" {...field} className="pl-10" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                     <div className="relative">
                      <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Textarea placeholder="123, Foodie Lane..." {...field} className="pl-10 min-h-[100px]" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit">Save and Continue</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


function ProfilePageSkeleton() {
    return (
         <div className="container py-12">
            <div className="mb-8">
                <BackButton />
            </div>
            <div className="text-center mb-8">
                <Skeleton className="h-12 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="flex justify-end">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

    
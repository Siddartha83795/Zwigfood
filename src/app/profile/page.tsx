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
import { mockUserProfile } from '@/lib/data';
import { User, Mail, Phone, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { UserProfile } from '@/lib/types';

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
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone,
      address: userProfile.address || '',
    },
    // This will reset the form with new values when userProfile state changes
    values: userProfile 
  });

  function onSubmit(data: ProfileFormValues) {
    console.log('Profile updated:', data);
    // Simulate updating the user's profile state
    setUserProfile(currentProfile => ({...currentProfile, ...data, isProfileComplete: true}));
    
    // We'll simulate this by updating a value in localStorage.
    localStorage.setItem('isProfileComplete', 'true');
    toast({
      title: "Profile Updated",
      description: "Your information has been saved successfully.",
    });
    // Redirect to outlets page after profile completion
    router.push('/outlets');
  }

  return (
    <div className="container py-12">
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
                        <Input type="email" placeholder="you@example.com" {...field} className="pl-10" />
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

'use client';

import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Users } from 'lucide-react';

interface ClientProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export default function StaffDashboardPage() {
  const router = useRouter();
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'client'));
  }, [firestore]);

  const { data: clients, isLoading, error } = useCollection<ClientProfile>(clientsQuery);
  
  // Redirect if user is not staff
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, isUserLoading, router]);

  const renderSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );

  return (
    <div className="container py-12">
       <div className="mb-8">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
                Staff Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                View all registered clients.
            </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users />
              Client List
            </CardTitle>
            <CardDescription>
              A list of all users with the 'client' role.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading && renderSkeleton()}
             {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error Fetching Clients</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}
            {!isLoading && !error && (
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone Number</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients && clients.length > 0 ? (
                     clients.map(client => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.fullName}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{client.phoneNumber}</TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No clients found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

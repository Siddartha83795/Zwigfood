'use client';

import { useState, useEffect } from 'react';
import { mockUserProfile } from '@/lib/data';
import type { UserProfile } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function StaffDashboardPage() {
  const [clients, setClients] = useState<UserProfile[]>([]);
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'staff') {
      router.push('/auth/login');
      return;
    }
    // In a real app, this would be an API call
    // For now, we will simulate it with mock data
    const mockClients: UserProfile[] = [
      { id: '1', fullName: 'Alice Johnson', email: 'alice@example.com', phoneNumber: '+919876543210', role: 'client'},
      { id: '2', fullName: 'Bob Williams', email: 'bob@example.com', phoneNumber: '+919876543211', role: 'client' },
      { id: '3', fullName: 'Charlie Brown', email: 'charlie@example.com', phoneNumber: '+919876543212', role: 'client' },
    ];
    setClients(mockClients);
  }, [router]);

  return (
    <div className="container py-12">
       <div className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
                    Staff Dashboard
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    View registered clients and manage orders.
                </p>
            </div>
            <div>
                <Button asChild>
                    <Link href="/staff/dashboard/outlet-1">View Orders</Link>
                </Button>
            </div>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length > 0 ? (
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
          </CardContent>
        </Card>
    </div>
  );
}

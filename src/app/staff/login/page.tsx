
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, User, Building } from 'lucide-react';
import { outlets } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StaffLoginPage() {
  const [selectedOutlet, setSelectedOutlet] = useState(outlets[0].id);

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Staff Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
               <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="employeeId" defaultValue="ST-001" className="pl-10"/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
               <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" defaultValue="staff123" className="pl-10"/>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground pt-4">
                After login, you will be redirected to the selected outlet's dashboard.
            </p>
            <Button asChild className="w-full">
                <Link href={`/staff/dashboard/${selectedOutlet}`}>Login</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

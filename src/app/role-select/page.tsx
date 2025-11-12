import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Briefcase } from 'lucide-react';

const roles = [
  {
    name: 'Customer',
    icon: <User className="h-12 w-12 text-primary" />,
    href: '/outlets',
    description: 'Browse menus and place your order.',
  },
  {
    name: 'Staff',
    icon: <Briefcase className="h-12 w-12 text-accent" />,
    href: '/staff/login',
    description: 'Manage orders and view dashboard.',
  },
];

export default function RoleSelectPage() {
  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
          Welcome to DineHub
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Please select your role to continue.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {roles.map((role) => (
            <Link href={role.href} key={role.name}>
              <Card className="group h-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary text-center">
                <CardHeader className="items-center">
                  {role.icon}
                  <CardTitle className="mt-4 text-2xl font-headline">
                    {role.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{role.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

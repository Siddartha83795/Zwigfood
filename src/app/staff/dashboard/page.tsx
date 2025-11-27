'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StaffDashboardRedirect() {
    const router = useRouter();

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'staff') {
            router.replace('/outlets');
        } else {
            router.replace('/auth/login');
        }
    }, [router]);

    return null;
}

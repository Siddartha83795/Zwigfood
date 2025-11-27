'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StaffDashboardRedirect() {
    const router = useRouter();

    useEffect(() => {
        // All staff are now redirected to the outlet selection page
        router.replace('/outlets');
    }, [router]);

    // This component renders nothing as it only handles redirection.
    return null;
}


'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated and redirects to the dashboard admin tab.
export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard?tab=admin');
    }, [router]);

    return null; // Render nothing while redirecting
}

'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-4">
        Disaster Aid Coordination Platform
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
        Connecting those in need with those who can help. Efficiently manage aid requests, resources, and volunteers during critical times.
      </p>
 
    </div>
  );
}

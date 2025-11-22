'use client';

import { useState, useEffect } from 'react';
import type { Booking, Space } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RequestsManagement from './requests-management';
import SpacesManagement from './spaces-management';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);

  useEffect(() => {
    const bookingsQuery = query(collection(db, 'bookings'));
    const spacesQuery = query(collection(db, 'spaces'));

    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(bookingsData);
    });

    const unsubscribeSpaces = onSnapshot(spacesQuery, (snapshot) => {
      const spacesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Space));
      setSpaces(spacesData);
    });

    return () => {
      unsubscribeBookings();
      unsubscribeSpaces();
    };
  }, []);


  return (
    <Tabs defaultValue="requests" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="requests">Gerenciar Solicitações</TabsTrigger>
        <TabsTrigger value="spaces">Gerenciar Espaços</TabsTrigger>
      </TabsList>
      <TabsContent value="requests">
        <RequestsManagement 
            bookings={bookings} 
        />
      </TabsContent>
      <TabsContent value="spaces">
        <SpacesManagement spaces={spaces} setSpaces={setSpaces} />
      </TabsContent>
    </Tabs>
  );
}

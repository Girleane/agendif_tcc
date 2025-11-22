
'use client';

import { useMemo, useEffect, useState } from 'react';
import type { Booking, Space } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Hourglass, CheckCircle2, XCircle, Building2, DoorOpen, Calendar, Clock, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function RequestsList() {
  const { user } = useAuth();
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const q = query(collection(db, 'bookings'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const bookingsData: Booking[] = [];
        querySnapshot.forEach((doc) => {
            bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
        });
        setBookings(bookingsData);
    });

    return () => unsubscribe();
  }, [user, router]);
  
  useEffect(() => {
    const spacesQuery = query(collection(db, 'spaces'));
    const unsubscribeSpaces = onSnapshot(spacesQuery, (snapshot) => {
        const spacesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Space));
        setSpaces(spacesData);
    });
    return () => unsubscribeSpaces();
  }, []);

  const handleDelete = async (bookingId: string) => {
    setIsDeleting(bookingId);
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
    } catch (error) {
      console.error("Error deleting booking: ", error);
    } finally {
      setIsDeleting(null);
    }
  };
  
  const userBookings = useMemo(() => {
    if (!user || !spaces.length) return [];
    return bookings
      .map(booking => {
          const space = spaces.find(s => s.id === booking.spaceId);
          const room = space?.rooms.find(r => r.id === booking.roomId);
          return {
              ...booking,
              spaceName: space?.name || 'N/A',
              roomName: room?.name || 'N/A',
          }
      })
      .sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
  }, [bookings, user, spaces]);

  const getStatusInfo = (status: Booking['status']) => {
    switch (status) {
      case 'approved':
        return {
          text: 'Aprovado',
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        };
      case 'pending':
        return {
          text: 'Pendente',
          icon: <Hourglass className="h-5 w-5 text-yellow-600" />,
          badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        };
      case 'rejected':
        return {
          text: 'Rejeitado',
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
    }
  };

  if (!user) {
    return null; // or a loading spinner
  }

  if (userBookings.length === 0) {
    return (
        <div className="text-center py-16 px-4">
            <h2 className="text-xl font-semibold text-muted-foreground">Nenhuma solicitação encontrada.</h2>
            <p className="text-muted-foreground mt-2">Você ainda não fez nenhuma reserva de sala.</p>
        </div>
    );
  }

  return (
    <div className="w-full space-y-4 md:space-y-6">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {userBookings.map((booking) => {
            const statusInfo = getStatusInfo(booking.status);
            return (
              <Card key={booking.id} className="flex flex-col">
                <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium pr-8">{booking.reason}</CardTitle>
                  <div className="flex items-center space-x-1">
                    {statusInfo.icon}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><Building2 className="h-4 w-4"/> {booking.spaceName}</p>
                    <p className="flex items-center gap-2"><DoorOpen className="h-4 w-4"/> {booking.roomName}</p>
                    <p className="flex items-center gap-2"><Calendar className="h-4 w-4"/> {booking.day}</p>
                    <p className="flex items-center gap-2"><Clock className="h-4 w-4"/> {booking.timeSlot}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                     <Badge variant="secondary" className={statusInfo.badgeClass}>{statusInfo.text}</Badge>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                           <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente sua solicitação de reserva.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting === booking.id}>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(booking.id)}
                            disabled={isDeleting === booking.id}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                             {isDeleting === booking.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             {isDeleting === booking.id ? 'Excluindo...' : 'Excluir'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
    </div>
  );
}

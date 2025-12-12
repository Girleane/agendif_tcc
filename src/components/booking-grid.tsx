
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Booking, Space, User } from '@/types';
import { timeSlots } from '@/lib/data';
import { BookingDialog } from './booking-dialog';
import { Building2, DoorOpen, PlusCircle, Loader2, User as UserIcon, Mail, BookOpen, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, serverTimestamp, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface BookingGridProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  searchTerm: string;
}

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const formatWeekdayAndDay = (date: Date) => {
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
  const day = date.toLocaleDateString('pt-BR', { day: 'numeric' });
  const formattedWeekday = weekday.split('-')[0];
  return `${formattedWeekday.charAt(0).toUpperCase() + formattedWeekday.slice(1)} ${day}`;
};

export default function BookingGrid({ bookings, searchTerm }: BookingGridProps) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [users, setUsers] = useState<Record<string, { name: string; email: string; }>>({});
  const [selectedSlot, setSelectedSlot] = useState<{ space: Space; room: Space['rooms'][0]; date: Date; timeSlot: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'spaces'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const spacesData: Space[] = [];
      querySnapshot.forEach((doc) => {
        spacesData.push({ id: doc.id, ...doc.data() } as Space);
      });
      setSpaces(spacesData);
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const usersData: Record<string, { name: string; email: string; }> = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            usersData[doc.id] = { name: data.name, email: data.email };
        });
        setUsers(usersData);
    });

    return () => unsubscribeUsers();
  }, []);

  const filteredSpaces = useMemo(() => {
    if (!searchTerm) {
      return spaces;
    }
    return spaces.filter(space => 
      space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.rooms.some(room => room.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [spaces, searchTerm]);

  const visibleBookings = useMemo(() => {
    return bookings.filter(b => b.status !== 'rejected');
  }, [bookings]);

  const handleSlotClick = (space: Space, room: Space['rooms'][0], date: Date, timeSlot: string) => {
    setSelectedSlot({ space, room, date, timeSlot });
  };

  const handleBookingSubmit = async (reason: string) => {
    if (!selectedSlot || !user) return;
  
    const bookingDate = Timestamp.fromDate(selectedSlot.date);
  
    const newBooking = {
      spaceId: selectedSlot.space.id,
      roomId: selectedSlot.room.id,
      userId: user.id,
      reason,
      date: bookingDate,
      timeSlot: selectedSlot.timeSlot,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
    };
      
    addDoc(collection(db, 'bookings'), newBooking);
      
    setSelectedSlot(null); 
      
    toast({
        title: 'Solicitação Enviada!',
        description: 'Sua reserva para a sala foi enviada para aprovação.',
        variant: 'default',
    });
  };

  const onBookingDelete = async (bookingId: string) => {
    setIsDeleting(bookingId);
    try {
        await deleteDoc(doc(db, 'bookings', bookingId));
        toast({
            title: 'Reserva Deletada',
            description: 'A reserva foi removida com sucesso.',
        });
    } catch (error) {
        toast({
            title: 'Erro ao deletar',
            description: 'Não foi possível remover a reserva.',
            variant: 'destructive',
        })
    } finally {
        setIsDeleting(null);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
    setIsUpdatingStatus(bookingId);
    try {
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, { status });
        toast({
            title: 'Status Atualizado!',
            description: `A reserva foi ${status === 'approved' ? 'aprovada' : 'rejeitada'}.`,
        });
    } catch (error) {
        toast({
            title: 'Erro ao atualizar',
            description: 'Não foi possível atualizar o status da reserva.',
            variant: 'destructive',
        });
    } finally {
        setIsUpdatingStatus(null);
    }
  };

  const getBookingForSlot = (roomId: string, date: Date, timeSlot: string) => {
    return visibleBookings.find(b => 
      b.roomId === roomId &&
      b.date && 
      typeof b.date.toDate === 'function' &&
      isSameDay(b.date.toDate(), date) &&
      b.timeSlot === timeSlot
    );
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Aprovado</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pendente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return null;
    }
  };
  
  const AdminBookingDetails = ({ booking }: { booking: Booking }) => {
    const bookingUser = users[booking.userId];
    if (!bookingUser) return null;

    return (
        <PopoverContent className="w-80">
            <div className="grid gap-4">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">Detalhes da Reserva</h4>
                    <p className="text-sm text-muted-foreground">
                        Informações completas sobre a solicitação.
                    </p>
                </div>
                <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span className="font-semibold">{bookingUser.name}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{bookingUser.email}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{booking.reason}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {booking.date && typeof booking.date.toDate === 'function' ? (
                          <span>{booking.date.toDate().toLocaleDateString('pt-BR')}, {booking.timeSlot}</span>
                        ) : (
                          <span>Data inválida</span>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline"
                        className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        size="sm" 
                        onClick={() => handleUpdateStatus(booking.id, 'approved')}
                        disabled={isUpdatingStatus === booking.id}
                    >
                        {isUpdatingStatus === booking.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Aprovar
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                        disabled={isUpdatingStatus === booking.id}
                    >
                        {isUpdatingStatus === booking.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Rejeitar
                    </Button>
                </div>
            </div>
        </PopoverContent>
    )
  }

  const getWeekInfo = (offset: number) => {
    const today = new Date();
    today.setDate(today.getDate() + offset * 7);
    const dayOfWeek = today.getDay(); 
  
    const monday = new Date(today);
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + diffToMonday);
  
    const weekDays = Array.from({ length: 5 }).map((_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return day;
    });
  
    const formatOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    const formatter = new Intl.DateTimeFormat('pt-BR', formatOptions);
  
    const capitalizeMonth = (dateString: string) => {
      const parts = dateString.split(' de ');
      if (parts.length === 2) {
        const month = parts[1];
        return `${parts[0]} de ${month.charAt(0).toUpperCase() + month.slice(1)}`;
      }
      return dateString;
    };
  
    const firstDay = weekDays[0];
    const lastDay = weekDays[4];
  
    return {
      weekDays,
      display: `${capitalizeMonth(formatter.format(firstDay))} - ${capitalizeMonth(formatter.format(lastDay))}`,
    };
  };

  const { weekDays, display: weekDisplay } = getWeekInfo(weekOffset);

  if (filteredSpaces.length === 0) {
    return (
        <div className="text-center py-16 px-4">
            <h2 className="text-xl font-semibold text-muted-foreground">Nenhum espaço encontrado.</h2>
            <p className="text-muted-foreground mt-2">Tente ajustar seus termos de busca.</p>
        </div>
    );
  }

  return (
    <>
      <Accordion type="multiple" className="w-full space-y-4" defaultValue={spaces.map(s => s.id)}>
        {filteredSpaces.map((space) => (
          <AccordionItem key={space.id} value={space.id} className="border-none">
             <Card className="overflow-hidden">
                <AccordionTrigger className="p-4 sm:p-6 bg-muted/50 hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                        <Building2 className="h-6 w-6 text-primary shrink-0" />
                        <h2 className="text-lg sm:text-xl font-semibold font-headline">{space.name}</h2>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <Accordion type="multiple" className="w-full">
                      {space.rooms.map((room) => (
                        <AccordionItem key={room.id} value={room.id} className="border-t">
                            <AccordionTrigger className="px-4 sm:px-6 py-4 bg-background hover:bg-muted/30 hover:no-underline">
                                <div className="flex items-center gap-2 text-left">
                                    <DoorOpen className="h-5 w-5 text-accent shrink-0"/>
                                    <span className="font-medium text-base sm:text-lg">{room.name}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="bg-background p-0">
                                <hr />
                                <div className="px-4 sm:px-6 pt-4">
                                  <div className="flex justify-start items-center gap-4 text-base pb-4 text-green-700">
                                    <Button variant="ghost" size="icon" onClick={() => setWeekOffset(weekOffset - 1)}>
                                      <ChevronLeft className="h-6 w-6" />
                                    </Button>
                                    <p className="w-64 text-center">{weekDisplay}</p>
                                    <Button variant="ghost" size="icon" onClick={() => setWeekOffset(weekOffset + 1)}>
                                      <ChevronRight className="h-6 w-6" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="overflow-x-auto px-2 sm:px-4 pb-2 sm:pb-4">
                                    <Table className="border rounded-lg">
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="w-[120px] sm:w-[150px] text-xs sm:text-sm">Horário</TableHead>
                                          {weekDays.map((day, index) => (
                                            <TableHead key={day.toISOString()} className={cn('border-l min-w-[120px] text-xs sm:text-sm', index % 2 !== 0 && 'bg-primary/5')}>
                                              {formatWeekdayAndDay(day)}
                                            </TableHead>
                                          ))}
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {timeSlots.map(timeSlot => (
                                          <TableRow key={timeSlot}>
                                            <TableCell className="font-medium text-xs sm:text-sm">{timeSlot}</TableCell>
                                            {weekDays.map((day, index) => {
                                              const booking = getBookingForSlot(room.id, day, timeSlot);
                                              const isAdmin = user?.role === 'admin';
                                              const isOwner = user?.id === booking?.userId;

                                              return (
                                                <TableCell key={day.toISOString()} className={cn('border-l p-1 sm:p-2', index % 2 !== 0 && 'bg-primary/5')}>
                                                  {booking ? (
                                                    isAdmin ? (
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <div className="flex flex-col text-xs p-2 rounded-md bg-muted cursor-pointer hover:bg-muted/80 h-full justify-center">
                                                                    <span>{booking.reason}</span>
                                                                    <span className="font-semibold">{users[booking.userId]?.name || '...'}</span>
                                                                    {getStatusBadge(booking.status)}
                                                                </div>
                                                            </PopoverTrigger>
                                                            <AdminBookingDetails booking={booking} />
                                                        </Popover>
                                                    ) : isOwner ? (
                                                        <div className="flex flex-col text-xs p-2 rounded-md bg-muted items-center justify-center h-full">
                                                            {getStatusBadge(booking.status)}
                                                        </div>
                                                    ) : (
                                                         <div className="flex flex-col text-xs p-2 rounded-md bg-muted items-center justify-center h-full">
                                                            <Badge variant="secondary">Ocupado</Badge>
                                                        </div>
                                                    )
                                                  ) : (
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="w-full h-full text-primary hover:bg-primary/10 flex flex-col sm:flex-row items-center justify-center text-xs p-1"
                                                      onClick={() => handleSlotClick(space, room, day, timeSlot)}
                                                    >
                                                      <PlusCircle className="h-4 w-4 mb-1 sm:mb-0 sm:mr-2"/>
                                                      Reservar
                                                    </Button>
                                                  )}
                                                </TableCell>
                                              );
                                            })}
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </AccordionContent>
             </Card>
          </AccordionItem>
        ))}
      </Accordion>

      <BookingDialog
        isOpen={!!selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onSubmit={handleBookingSubmit}
        details={selectedSlot ? `${selectedSlot.room.name} (${selectedSlot.space.name}) - ${selectedSlot.date.toLocaleDateString('pt-BR')} ${selectedSlot.timeSlot}` : ''}
      />
    </>
  );
}


'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Booking, Space } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal, Check, X, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, collection, onSnapshot, query, Unsubscribe } from 'firebase/firestore';

interface RequestsManagementProps {
    bookings: Booking[];
}

export default function RequestsManagement({ bookings }: RequestsManagementProps) {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [users, setUsers] = useState<Record<string, { name: string }>>({});

    useEffect(() => {
        // Real-time listener for spaces
        const spacesQuery = query(collection(db, 'spaces'));
        const unsubscribeSpaces = onSnapshot(spacesQuery, (snapshot) => {
            const spacesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Space));
            setSpaces(spacesData);
        });

        // Real-time listener for users
        const usersQuery = query(collection(db, 'users'));
        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
            const usersData: Record<string, { name: string }> = {};
            snapshot.forEach(doc => {
                usersData[doc.id] = { name: doc.data().name };
            });
            setUsers(usersData);
        });

        return () => {
            unsubscribeSpaces();
            unsubscribeUsers();
        };
    }, []);

    const bookingsWithDetails = useMemo(() => {
        if (!spaces.length) return [];
        return bookings.map(booking => {
            const space = spaces.find(s => s.id === booking.spaceId);
            const room = space?.rooms.find(r => r.id === booking.roomId);
            return {
                ...booking,
                spaceName: space?.name || 'N/A',
                roomName: room?.name || 'N/A',
                userName: users[booking.userId]?.name || 'Usuário desconhecido',
            }
        })
        .sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });
    }, [bookings, spaces, users]);

    const handleStatusChange = async (booking: Booking, status: 'approved' | 'rejected') => {
        const bookingRef = doc(db, 'bookings', booking.id);
        await updateDoc(bookingRef, { status });
    }
    
    const onBookingDelete = async (bookingId: string) => {
        const bookingRef = doc(db, 'bookings', bookingId);
        await deleteDoc(bookingRef);
    }

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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Solicitações de Reserva</CardTitle>
                <CardDescription>Aprove, rejeite ou delete as solicitações de reserva.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Sala</TableHead>
                                <TableHead>Data/Hora</TableHead>
                                <TableHead>Motivo</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookingsWithDetails.map(booking => (
                                <TableRow key={booking.id}>
                                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                    <TableCell>{booking.userName}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{booking.roomName}</div>
                                        <div className="text-xs text-muted-foreground">{booking.spaceName}</div>
                                    </TableCell>
                                    <TableCell>{(booking.date && typeof booking.date.toDate === 'function') ? booking.date.toDate().toLocaleDateString('pt-BR') : (booking.day || 'Data inválida')}, {booking.timeSlot}</TableCell>
                                    <TableCell>{booking.reason}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                {booking.status === 'pending' && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(booking, 'approved')}>
                                                            <Check className="mr-2 h-4 w-4" /> Aprovar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(booking, 'rejected')}>
                                                            <X className="mr-2 h-4 w-4" /> Rejeitar
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuItem className="text-red-600" onClick={() => onBookingDelete(booking.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Deletar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

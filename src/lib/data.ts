import type { Space, Booking } from '@/types';

export const timeSlots = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
  '21:00 - 22:00',
];

export const daysOfWeek: ('Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta')[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

// These are now just for seeding the database if needed, not used directly in the app.
export const initialSpaces: Space[] = [
  {
    id: 'space_1',
    name: 'Bloco A - Principal',
    rooms: [
      { id: 'room_a1', name: 'Sala A101' },
      { id: 'room_a2', name: 'Sala A102 (Laboratório)' },
      { id: 'room_a3', name: 'Auditório' },
    ],
  },
  {
    id: 'space_2',
    name: 'Bloco B - Anexo',
    rooms: [
        { id: 'room_b1', name: 'Sala B201' },
        { id: 'room_b2', name: 'Sala B202' },
    ],
  },
];

export const initialBookings: Booking[] = [
    {
        id: 'booking_1',
        spaceId: 'space_1',
        roomId: 'room_a1',
        userId: 'user_2',
        userName: 'Maria Souza',
        reason: 'Aula de Cálculo I',
        day: 'Segunda',
        timeSlot: '08:00 - 09:00',
        status: 'approved',
    },
    {
        id: 'booking_2',
        spaceId: 'space_1',
        roomId: 'room_a2',
        userId: 'user_3',
        userName: 'Carlos Ferreira',
        reason: 'Laboratório de Física',
        day: 'Terça',
        timeSlot: '10:00 - 11:00',
        status: 'approved',
    },
    {
        id: 'booking_3',
        spaceId: 'space_1',
        roomId: 'room_a1',
        userId: 'user_1',
        userName: 'João Silva',
        reason: 'Reunião de grupo',
        day: 'Quarta',
        timeSlot: '14:00 - 15:00',
        status: 'pending',
    },
    {
        id: 'booking_4',
        spaceId: 'space_2',
        roomId: 'room_b1',
        userId: 'user_4',
        userName: 'Ana Pereira',
        reason: 'Palestra sobre IA',
        day: 'Sexta',
        timeSlot: '15:00 - 16:00',
        status: 'rejected',
    },
     {
        id: 'booking_5',
        spaceId: 'space_1',
        roomId: 'room_a3',
        userId: 'user_1',
        userName: 'João Silva',
        reason: 'Defesa de TCC',
        day: 'Quinta',
        timeSlot: '09:00 - 10:00',
        status: 'approved',
    },
];

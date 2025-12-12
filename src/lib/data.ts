import type { Space, Booking } from '@/types';
import { Timestamp } from 'firebase/firestore';

export const timeSlots = [
  '08:00 - 08:30',
  '08:30 - 09:00',
  '09:00 - 09:30',
  '09:30 - 10:00',
  '10:00 - 10:30',
  '10:30 - 11:00',
  '11:00 - 11:30',
  '11:30 - 12:00',
  '13:00 - 13:30',
  '13:30 - 14:00',
  '14:00 - 14:30',
  '14:30 - 15:00',
  '15:00 - 15:30',
  '15:30 - 16:00',
  '16:00 - 16:30',
  '16:30 - 17:00',
  '17:00 - 17:30',
  '17:30 - 18:00',
  '18:00 - 18:30',
  '18:30 - 19:00',
  '19:00 - 19:30',
  '19:30 - 20:00',
  '20:00 - 20:30',
  '20:30 - 21:00',
  '21:00 - 21:30',
  '21:30 - 22:00',
];

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

export const initialBookings: Omit<Booking, 'id' | 'createdAt'>[] = [
    // This data is not type-safe anymore and will be removed.
];


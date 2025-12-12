import { Timestamp } from "firebase/firestore";

export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface Booking {
  id: string;
  roomId: string;
  spaceId: string;
  userId: string;
  reason: string;
  date: Timestamp;
  timeSlot: string;
  status: BookingStatus;
  createdAt: Timestamp;
}

export interface Room {
  id: string;
  name: string;
}

export interface Space {
  id:string;
  name: string;
  rooms: Room[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

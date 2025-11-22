
'use client';

import { useState } from 'react';
import type { Space, Room } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';
import { Building2, DoorOpen, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, getDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';

interface SpacesManagementProps {
    spaces: Space[];
    setSpaces: React.Dispatch<React.SetStateAction<Space[]>>;
}

export default function SpacesManagement({ spaces, setSpaces }: SpacesManagementProps) {
    const [spaceName, setSpaceName] = useState('');
    const [roomName, setRoomName] = useState('');
    const [isSpaceDialogOpen, setIsSpaceDialogOpen] = useState(false);
    const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
    const [isEditSpaceDialogOpen, setIsEditSpaceDialogOpen] = useState(false);
    const [isEditRoomDialogOpen, setIsEditRoomDialogOpen] = useState(false);
    
    const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);
    const [editingSpace, setEditingSpace] = useState<Space | null>(null);
    const [editingRoom, setEditingRoom] = useState<{ spaceId: string, room: Room } | null>(null);

    const [editedSpaceName, setEditedSpaceName] = useState('');
    const [editedRoomName, setEditedRoomName] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    
    // Open Dialogs Handlers
    const openAddRoomDialog = (spaceId: string) => {
        setCurrentSpaceId(spaceId);
        setIsRoomDialogOpen(true);
    };

    const openEditSpaceDialog = (space: Space) => {
        setEditingSpace(space);
        setEditedSpaceName(space.name);
        setIsEditSpaceDialogOpen(true);
    };

    const openEditRoomDialog = (spaceId: string, room: Room) => {
        setEditingRoom({ spaceId, room });
        setEditedRoomName(room.name);
        setIsEditRoomDialogOpen(true);
    };

    // Close Dialogs Handlers
    const closeAllDialogs = () => {
        setIsSpaceDialogOpen(false);
        setIsRoomDialogOpen(false);
        setIsEditSpaceDialogOpen(false);
        setIsEditRoomDialogOpen(false);
        setSpaceName('');
        setRoomName('');
        setEditedSpaceName('');
        setEditedRoomName('');
        setCurrentSpaceId(null);
        setEditingSpace(null);
        setEditingRoom(null);
    };


    // CRUD Handlers
    const handleAddSpace = async () => {
        if (!spaceName.trim()) return;
        setIsSaving(true);
        const newSpace = {
            name: spaceName,
            rooms: [],
        };
        await addDoc(collection(db, 'spaces'), newSpace);
        setIsSaving(false);
        closeAllDialogs();
    };

    const handleEditSpace = async () => {
        if (!editedSpaceName.trim() || !editingSpace) return;
        setIsSaving(true);
        const spaceRef = doc(db, 'spaces', editingSpace.id);
        await updateDoc(spaceRef, { name: editedSpaceName });
        setIsSaving(false);
        closeAllDialogs();
    };

    const handleDeleteSpace = async (spaceId: string) => {
        // First, delete all bookings associated with this space
        const bookingsQuery = query(collection(db, 'bookings'), where('spaceId', '==', spaceId));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const batch = writeBatch(db);
        bookingsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        // Then, delete the space itself
        await deleteDoc(doc(db, 'spaces', spaceId));
    };

    const handleAddRoom = async () => {
        if (!roomName.trim() || !currentSpaceId) return;
        setIsSaving(true);
        const newRoom: Room = {
            id: `room_${Date.now()}`,
            name: roomName,
        };
        const spaceRef = doc(db, 'spaces', currentSpaceId);
        await updateDoc(spaceRef, {
            rooms: arrayUnion(newRoom)
        });
        setIsSaving(false);
        closeAllDialogs();
    };

    const handleEditRoom = async () => {
        if (!editedRoomName.trim() || !editingRoom) return;
        setIsSaving(true);

        const spaceRef = doc(db, 'spaces', editingRoom.spaceId);
        const spaceDoc = await getDoc(spaceRef);
        if (spaceDoc.exists()) {
            const spaceData = spaceDoc.data() as Space;
            const updatedRooms = spaceData.rooms.map(r => 
                r.id === editingRoom.room.id ? { ...r, name: editedRoomName } : r
            );
            await updateDoc(spaceRef, { rooms: updatedRooms });
        }
        
        setIsSaving(false);
        closeAllDialogs();
    };

    const handleDeleteRoom = async (spaceId: string, roomToDelete: Room) => {
        // First, delete all bookings for this specific room
        const bookingsQuery = query(collection(db, 'bookings'), where('roomId', '==', roomToDelete.id));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const batch = writeBatch(db);
        bookingsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Then, remove the room from the space's rooms array
        const spaceRef = doc(db, 'spaces', spaceId);
        await updateDoc(spaceRef, {
            rooms: arrayRemove(roomToDelete)
        });
    };

    return (
        <Card>
            <CardHeader className="flex-col sm:flex-row items-start sm:items-center sm:justify-between">
                <div className='mb-4 sm:mb-0'>
                    <CardTitle>Espaços e Salas</CardTitle>
                    <CardDescription>Adicione, edite ou remova espaços e salas.</CardDescription>
                </div>
                <Dialog open={isSpaceDialogOpen} onOpenChange={setIsSpaceDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Espaço
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Novo Espaço</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Label htmlFor="space-name">Nome do Espaço</Label>
                            <Input id="space-name" value={spaceName} onChange={(e) => setSpaceName(e.target.value)} placeholder="Ex: Bloco C - Biblioteca"/>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsSpaceDialogOpen(false)} disabled={isSaving}>Cancelar</Button>
                            <Button onClick={handleAddSpace} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSaving ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full space-y-2">
                    {spaces.map(space => (
                        <AccordionItem key={space.id} value={space.id} className="border rounded-md px-2 sm:px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-2 text-left">
                                    <Building2 className="h-5 w-5 text-primary shrink-0" />
                                    <span>{space.name}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pl-2">
                                <div className="space-y-2">
                                    {space.rooms.map(room => (
                                        <div key={room.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                            <div className="flex items-center gap-2">
                                                <DoorOpen className="h-4 w-4 text-accent" />
                                                <span className="text-sm">{room.name}</span>
                                            </div>
                                            <div>
                                                <Button variant="ghost" size="icon" onClick={() => openEditRoomDialog(space.id, room)}><Pencil className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteRoom(space.id, room)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-4 pt-2 border-t gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openAddRoomDialog(space.id)}>
                                            <Plus className="mr-2 h-4 w-4" /> Adicionar Sala
                                        </Button>
                                        <div className="flex items-center justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => openEditSpaceDialog(space)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Editar
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteSpace(space.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Deletar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>

             {/* Add Room Dialog */}
            <Dialog open={isRoomDialogOpen} onOpenChange={open => !open && closeAllDialogs()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Sala em {spaces.find(s => s.id === currentSpaceId)?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="room-name">Nome da Sala</Label>
                        <Input id="room-name" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Ex: Sala 303"/>
                    </div>
                    <DialogFooter>
                            <Button variant="outline" onClick={closeAllDialogs} disabled={isSaving}>Cancelar</Button>
                        <Button onClick={handleAddRoom} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Space Dialog */}
            <Dialog open={isEditSpaceDialogOpen} onOpenChange={open => !open && closeAllDialogs()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Espaço</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="edit-space-name">Nome do Espaço</Label>
                        <Input id="edit-space-name" value={editedSpaceName} onChange={(e) => setEditedSpaceName(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeAllDialogs} disabled={isSaving}>Cancelar</Button>
                        <Button onClick={handleEditSpace} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Room Dialog */}
            <Dialog open={isEditRoomDialogOpen} onOpenChange={open => !open && closeAllDialogs()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Sala</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="edit-room-name">Nome da Sala</Label>
                        <Input id="edit-room-name" value={editedRoomName} onChange={(e) => setEditedRoomName(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeAllDialogs} disabled={isSaving}>Cancelar</Button>
                        <Button onClick={handleEditRoom} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

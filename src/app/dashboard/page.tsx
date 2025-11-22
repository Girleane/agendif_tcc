'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import BookingGrid from '@/components/booking-grid';
import RequestsList from '@/components/requests-list';
import AdminDashboard from '@/components/admin/admin-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import type { Booking } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');

  const TABS = {
    GRID: 'grid',
    REQUESTS: 'requests',
    ADMIN: 'admin',
  } as const;

  const validTabs = user?.role === 'admin' 
    ? [TABS.GRID, TABS.REQUESTS, TABS.ADMIN]
    : [TABS.GRID, TABS.REQUESTS];

  const tabQuery = searchParams.get('tab');
  const defaultTab = tabQuery && validTabs.includes(tabQuery as any) ? tabQuery : TABS.GRID;

  // Lógica para decidir quando mostrar a busca (Agora inclui ADMIN)
  const showSearchBar = defaultTab === TABS.GRID || defaultTab === TABS.ADMIN;

  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'bookings'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookingsData: Booking[] = [];
      querySnapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
      });
      setBookings(bookingsData);
    });
    return () => unsubscribe();
  }, []);

  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.push(`/dashboard?${params.toString()}`);
    // Opcional: Limpar a busca ao trocar de aba para não confundir o usuário
    // setSearchTerm(''); 
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8 w-full">
      <Tabs value={defaultTab} onValueChange={onTabChange} className="w-full">
        
        {/* 1. HEADER WRAPPER (Sticky + Fundo) */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
          
          {/* 2. CONTAINER DE LARGURA (Mesma largura do conteúdo) */}
          <div className="max-w-7xl mx-auto px-4 w-full">
            
            {/* 3. LINHA DE REFERÊNCIA (Relative + Border-b) */}
            <div className="relative flex flex-col md:flex-row items-center justify-center py-4 w-full border-b border-border">
              
              {/* Tabs Centralizadas */}
              <TabsList className="min-w-max z-0">
                <TabsTrigger value={TABS.GRID}>Grade de Horários</TabsTrigger>
                <TabsTrigger value={TABS.REQUESTS}>Minhas Solicitações</TabsTrigger>
                {user?.role === 'admin' && (
                  <TabsTrigger value={TABS.ADMIN}>Administração</TabsTrigger>
                )}
              </TabsList>

              {/* Barra de Pesquisa (Visível em GRID e ADMIN) */}
              {showSearchBar && (
                <div className="w-full md:w-auto mt-4 md:mt-0 md:absolute md:right-0 z-10">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={defaultTab === TABS.ADMIN ? "Buscar usuário ou reserva..." : "Buscar sala ou espaço..."}
                      className="pl-9 bg-background"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="mt-4 w-full max-w-7xl mx-auto px-4">
            <TabsContent value={TABS.GRID} className="m-0">
               <BookingGrid bookings={bookings} setBookings={setBookings} searchTerm={searchTerm} />
            </TabsContent>
            
            <TabsContent value={TABS.REQUESTS} className="m-0">
              <div className="flex flex-col justify-center items-center h-full min-h-[calc(100vh-20rem)]">
                  <RequestsList />
              </div>
            </TabsContent>
            
            {user?.role === 'admin' && (
              <TabsContent value={TABS.ADMIN} className="m-0">
                  {/* Passando o searchTerm para o dashboard de admin */}
                  {/* @ts-ignore: Adicione a prop searchTerm no seu componente AdminDashboard se ainda não existir */}
                  <AdminDashboard searchTerm={searchTerm} />
              </TabsContent>
            )}
        </div>
      </Tabs>
    </div>
  );
}
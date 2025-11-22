import Header from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Toaster />
    </div>
  );
}

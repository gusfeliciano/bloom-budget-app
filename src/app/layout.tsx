import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext';
import AppContent from '@/components/layout/AppContent';
import { Toaster } from '@/components/ui/Toaster';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <AuthProvider>
          <AppContent className="h-full">{children}</AppContent>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
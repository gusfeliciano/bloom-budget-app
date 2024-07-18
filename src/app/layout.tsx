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
    <html lang="en">
      <body>
        <AuthProvider>
          <AppContent>
            {children}
          </AppContent>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

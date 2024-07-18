import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext';
import AppContent from '@/components/layout/AppContent';

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
        </AuthProvider>
      </body>
    </html>
  );
}
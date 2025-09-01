import { ThemeProvider } from "@/components/ThemeProvider"
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css'; 
export const metadata = {
  title: 'Disaster Aid Coordination',
  description: 'A platform to coordinate disaster relief efforts.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
              <Toaster position="top-center" />
              <Header />
              <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {children}
              </main>
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
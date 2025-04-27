import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/auth/context";
import { ThemeProvider } from "@/components/theme-provider";
import { DecimalPrecisionProvider } from '@/contexts/decimal-precision-context';
import { ClientLayout } from '@/components/layout/client-layout';
import { metadata } from './metadata';

const inter = Inter({ subsets: ["latin"] });

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DecimalPrecisionProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
            </DecimalPrecisionProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

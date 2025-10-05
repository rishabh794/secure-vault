import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext"; 
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> 
          <Header />
          <Toaster position="top-center" reverseOrder={false} />
          <main >
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
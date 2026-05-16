import { IBM_Plex_Sans } from "next/font/google";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext"; 
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={ibmPlexSans.className}>
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
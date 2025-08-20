import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" forcedTheme="dark" storageKey="gamehub-theme">
            <Toaster theme="light" position="bottom-center"/>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>

  );
}

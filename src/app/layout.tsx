import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import LoaderProvider from "@/components/providers/LoaderProvider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppDialog } from "@/components/ui/app-dialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Portal",
  description: "POS system administration portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* Extensions (e.g. ColorZilla) inject attrs like cz-shortcut-listen on <body> */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider>
            <LoaderProvider>
              {children}
            </LoaderProvider>
          </ThemeProvider>
        </QueryProvider>
        <AppDialog />
        <Toaster
          position="top-right"
          theme="light"
          closeButton
          toastOptions={{
            style: {
              background: "var(--brand-toast)",
              backgroundColor: "var(--brand-toast)",
              color: "#ffffff",
              border: "1px solid var(--brand-primary-dark)",
              borderRadius: 16,
            },
            classNames: {
              toast: "saas-toast",
              title: "saas-toast-title",
              description: "saas-toast-description",
              closeButton: "saas-toast-close",
              success: "saas-toast-success",
              error: "saas-toast-error",
              info: "saas-toast-info",
              warning: "saas-toast-warning",
            },
          }}
        />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LAN Datathon 2026 | Sistem Penilaian Dewan Juri",
  description:
    "Aplikasi sistem penilaian dewan juri dan dashboard rekapitulasi nilai kompetisi LAN Datathon 2026 - Lembaga Administrasi Negara RI",
  authors: [{ name: "LAN RI" }],
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans bg-slate-50/70 text-slate-900"
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

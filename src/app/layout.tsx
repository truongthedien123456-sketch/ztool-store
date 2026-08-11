import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Navbar
import Navbar from "@/components/Navbar";

// Footer
import Footer from "@/components/Footer";

// Cụm nút Zalo & Chat nổi
import SocialFloatButtons from "@/components/SocialFloatButtons";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZTOOL - Chuyên Cung Cấp Tool FiveM",
  description: "Hệ thống tự động hóa trải nghiệm game của bạn",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-[#05080d] text-white relative">
        
        {/* NAVBAR */}
        <Navbar />

        {/* NỘI DUNG TRANG */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* CỤM NÚT NỔI ZALO & CHAT TAWK.TO */}
        <SocialFloatButtons />

        {/* FOOTER */}
        <Footer />

      </body>
    </html>
  );
}
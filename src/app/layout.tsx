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
      <body className="min-h-screen bg-[#05080d] text-white relative selection:bg-cyan-500 selection:text-black overflow-x-hidden">
        
        {/* NỀN THÀNH PHỐ DẠNG FIXED LAYER SEPARATE (TRIỆT TIỆU LAG KHI CUỘN) */}
        <div 
          className="fixed inset-0 pointer-events-none -z-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(5, 8, 13, 0.45), rgba(5, 8, 13, 0.65)), url('/bg-hero.jpg')`
          }}
        />

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
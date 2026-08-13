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

// ================= BỘ METADATA SEO & XÁC MINH GOOGLE =================
export const metadata: Metadata = {
  title: "ZTool - Chuyên cung cấp Tool Auto Farm GTA/Fivem",
  description: "Hệ thống auto farm Fivem/Launcher hàng đầu Việt Nam. Cung Cấp Tool Auto Câu Cá, Auto Đào Đá, ... Uy Tín, Bảo Mật, An Toàn, Key tự động 24/7",
  keywords: [
    "Tool Auto Farm FiveM", 
    "Tool FiveM", 
    "Auto câu cá FiveM", 
    "Auto đào đá FiveM", 
    "Tool FiveM giá rẻ", 
    "ZTOOL", 
    "ZTOOL STORE",
    "Hack FiveM", 
    "Auto farm GTA V"
  ],
  verification: {
    google: "googlef85e0221c678e202", // Mã xác minh Google Search Console
  },
  openGraph: {
    title: "ZTool - Chuyên cung cấp Tool Auto Farm GTA/Fivem",
    description: "Hệ thống auto farm Fivem/Launcher hàng đầu Việt Nam. Cung Cấp Tool Auto Câu Cá, Auto Đào Đá, ... Uy Tín, Bảo Mật, An Toàn, Key tự động 24/7",
    url: "https://ztool-store.vercel.app",
    siteName: "ZTOOL",
    images: [
      {
        url: "https://ztool-store.vercel.app/logo.jpg",
        width: 1200,
        height: 630,
        alt: "ZTOOL FiveM Automation",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
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
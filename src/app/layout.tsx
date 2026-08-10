import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// IMPORT THÊM NAVBAR VÀO ĐÂY
import Navbar from "@/components/Navbar"; 

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

// Đã cập nhật tham số children cho đúng cú pháp TypeScript của Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080B10] text-white">
        {/* ĐẶT NAVBAR Ở ĐÂY ĐỂ NÓ LUÔN ĐỨNG YÊN KHI CHUYỂN TRANG */}
        <Navbar />
        {children}
      </body>
    </html>
  );
}
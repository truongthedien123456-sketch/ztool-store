'use client';

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-cyan-500/20 bg-[#080D15]/40 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
      {/* Glow nền phía trên Footer */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[250px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/[0.08] blur-[150px]" />

      <div className="relative mx-auto max-w-6xl px-6">

        {/* ================= FOOTER MAIN ================= */}
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-16">

          {/* ================= BRAND ================= */}
          <div className="max-w-md space-y-4">

            {/* Logo ZTOOL */}
            <Link href="/" className="group inline-flex items-center gap-3.5">
              <div
                className="
                  relative flex h-12 w-12 items-center justify-center
                  overflow-hidden rounded-2xl
                  border-2 border-cyan-400/80
                  bg-[#05080E] p-1
                  shadow-[0_0_20px_rgba(6,182,212,0.3)]
                  transition-all duration-300
                  group-hover:scale-105 group-hover:border-cyan-300
                  group-hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]
                "
              >
                <Image
                  src="/logo.jpg"
                  alt="ZTOOL"
                  fill
                  sizes="48px"
                  className="rounded-xl object-cover"
                />
              </div>

              <div>
                <div className="text-xl font-black tracking-wider text-white transition duration-300 group-hover:text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                  ZTOOL<span className="text-cyan-400">.STORE</span>
                </div>

                <div className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                  Chuyên Cung Cấp Tool FiveM
                </div>
              </div>
            </Link>

            {/* Mô tả */}
            <p className="mt-4 text-xs leading-relaxed font-medium text-slate-300">
              ZTOOL cung cấp các công cụ hỗ trợ FiveM, giúp tự động hóa
              những thao tác cần thiết và mang đến trải nghiệm thuận tiện,
              nhanh chóng cho người dùng.
            </p>

            <p className="mt-2 text-[11px] leading-relaxed italic text-slate-500">
              Các sản phẩm của ZTOOL được phát triển độc lập và cung cấp nhằm
              hỗ trợ người dùng trong quá trình sử dụng.
            </p>

            {/* ================= SOCIAL ================= */}
            <div className="mt-6 flex items-center gap-3 pt-1">

              {/* Discord */}
              <a
                href="https://discord.gg/sf8pXrMhPb"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl
                  border border-slate-800/80
                  bg-[#05080E]/80
                  text-slate-400
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-indigo-400/80
                  hover:bg-indigo-600/20
                  hover:text-indigo-300
                  hover:shadow-[0_0_20px_rgba(99,102,241,0.55)]
                "
                title="Tham gia Discord Server ZTool"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[18px] w-[18px]"
                  fill="currentColor"
                >
                  <path d="M19.54 5.32A16.9 16.9 0 0 0 15.44 4l-.5 1.02a15.4 15.4 0 0 0-5.88 0L8.56 4a16.9 16.9 0 0 0-4.1 1.32C1.86 9.27 1.16 13.12 1.51 16.92a16.9 16.9 0 0 0 5.03 2.55l1.22-1.67c-.67-.25-1.3-.56-1.9-.93l.46-.35c3.66 1.7 8.1 1.7 11.72 0l.46.35c-.6.37-1.23.68-1.9.93l1.22 1.67a16.9 16.9 0 0 0 5.03-2.55c.41-4.4-.7-8.2-3.31-11.6ZM8.82 15.1c-1.1 0-2.02-1.02-2.02-2.28s.9-2.28 2.02-2.28c1.13 0 2.03 1.03 2.02 2.28 0 1.26-.9 2.28-2.02 2.28Zm6.36 0c-1.1 0-2.02-1.02-2.02-2.28s.9-2.28 2.02-2.28c1.13 0 2.03 1.03 2.02 2.28 0 1.26-.9 2.28-2.02 2.28Z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61592809269339"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl
                  border border-slate-800/80
                  bg-[#05080E]/80
                  text-slate-400
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-blue-500/60
                  hover:bg-blue-500/10
                  hover:text-blue-400
                  hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[17px] w-[17px]"
                  fill="currentColor"
                >
                  <path d="M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.55.45-1 1-1Z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="#"
                aria-label="TikTok"
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl
                  border border-slate-800/80
                  bg-[#05080E]/80
                  text-slate-400
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-cyan-400/60
                  hover:bg-cyan-500/10
                  hover:text-cyan-300
                  hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[17px] w-[17px]"
                  fill="currentColor"
                >
                  <path d="M15.5 4c.25 1.9 1.3 3.2 3.5 3.3v3.2a8.1 8.1 0 0 1-3.5-1v6.2c0 3.7-2.3 5.8-5.4 5.8-3 0-5.1-2.2-5.1-5 0-3 2.4-5.2 5.6-5.2.4 0 .8 0 1.2.1v3.3a4 4 0 0 0-1.1-.2c-1.3 0-2.3.8-2.3 2 0 1.1.8 2 1.9 2 1.2 0 2-.8 2-2.3V4h3.2Z" />
                </svg>
              </a>

            </div>
          </div>

          {/* ================= SẢN PHẨM ================= */}
          <div>
            <h3 className="mb-5 text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> SẢN PHẨM
            </h3>

            <div className="space-y-3.5">
              <FooterLink href="/tools" text="Tất cả Tool Auto" />
              <FooterLink href="/projects" text="Dự án nổi bật" />
            </div>
          </div>

          {/* ================= HỖ TRỢ ================= */}
          <div>
            <h3 className="mb-5 text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> HỖ TRỢ HỆ THỐNG
            </h3>

            <div className="space-y-3.5">
              <FooterLink href="/huong-dan-kich-hoat" text="Hướng dẫn kích hoạt" />
              
              {/* Nút bấm Liên hệ kích hoạt Popup Zalo */}
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-zalo-modal'));
                  }
                }}
                className="
                  group flex items-center
                  text-xs font-bold text-slate-400
                  transition-all duration-200
                  hover:translate-x-1.5
                  hover:text-cyan-300
                  cursor-pointer text-left bg-transparent border-none p-0 outline-none
                "
              >
                <span className="mr-2 text-[10px] text-cyan-500/50 transition-colors group-hover:text-cyan-400">
                  •
                </span>
                Liên hệ Admin (Zalo)
              </button>

              {/* Link Discord trực tiếp */}
              <a
                href="https://discord.gg/sf8pXrMhPb"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group flex items-center
                  text-xs font-bold text-slate-400
                  transition-all duration-200
                  hover:translate-x-1.5
                  hover:text-indigo-300
                "
              >
                <span className="mr-2 text-[10px] text-indigo-400/50 transition-colors group-hover:text-indigo-400">
                  •
                </span>
                Cộng đồng Discord
              </a>
            </div>
          </div>

          {/* ================= CHÍNH SÁCH ================= */}
          <div>
            <h3 className="mb-5 text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> CHÍNH SÁCH & BẢO MẬT
            </h3>

            <div className="space-y-3.5">
              <FooterLink href="/chinh-sach-bao-mat" text="Chính sách bảo mật" />
              <FooterLink href="/dieu-khoan-su-dung" text="Điều khoản sử dụng" />
            </div>
          </div>

        </div>

        {/* ================= FOOTER BOTTOM ================= */}
        <div className="flex flex-col gap-3 border-t border-slate-800/80 py-6 text-xs text-slate-500 font-medium sm:flex-row sm:items-center sm:justify-between">

          <p>
            © 2026{" "}
            <span className="font-extrabold text-slate-300">
              ZTOOL.STORE
            </span>
            . Tất cả quyền được bảo lưu.
          </p>

          <p className="flex items-center gap-1.5">
            Thiết kế & Vận hành bởi{" "}
            <span className="font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
              ZTOOL TEAM
            </span>
          </p>

        </div>

      </div>
    </footer>
  );
}

/* =========================
   FOOTER LINK
========================= */

function FooterLink({
  href,
  text,
}: {
  href: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="
        group flex items-center
        text-xs font-bold text-slate-400
        transition-all duration-200
        hover:translate-x-1.5
        hover:text-cyan-300
      "
    >
      <span className="mr-2 text-[10px] text-cyan-500/50 transition-colors group-hover:text-cyan-400">
        •
      </span>

      {text}
    </Link>
  );
}
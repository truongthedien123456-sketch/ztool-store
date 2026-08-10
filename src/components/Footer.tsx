import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-cyan-400/10 bg-[#05080d]">
      {/* Glow nền */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6">

        {/* ================= FOOTER MAIN ================= */}
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-16">

          {/* ================= BRAND ================= */}
          <div className="max-w-md">

            {/* Logo */}
            <Link href="/" className="group inline-flex items-center gap-3">
              <div
                className="
                  flex h-12 w-12 items-center justify-center
                  rounded-xl
                  border border-cyan-400/60
                  bg-cyan-400/[0.06]
                  text-xl font-black italic
                  text-cyan-300
                  shadow-[0_0_20px_rgba(34,211,238,0.12)]
                  transition-all duration-300
                  group-hover:border-cyan-300
                  group-hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]
                "
              >
                Z
              </div>

              <div>
                <div className="text-xl font-extrabold tracking-wide text-white">
                  ZTOOL
                </div>

                <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                  Chuyên Cung Cấp Tool FiveM
                </div>
              </div>
            </Link>

            {/* Description */}
            <p className="mt-6 text-sm leading-7 text-slate-400">
              ZTOOL cung cấp các công cụ hỗ trợ FiveM, giúp tự động hóa
              những thao tác cần thiết và mang đến trải nghiệm thuận tiện,
              nhanh chóng cho người dùng.
            </p>

            <p className="mt-3 text-xs leading-6 text-slate-600">
              Các sản phẩm của ZTOOL được phát triển độc lập và cung cấp
              nhằm hỗ trợ người dùng trong quá trình sử dụng.
            </p>

            {/* Social */}
            <div className="mt-6 flex items-center gap-3">

              {/* Discord */}
              <a
                href="#"
                aria-label="Discord"
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl
                  border border-white/[0.07]
                  bg-white/[0.025]
                  text-slate-400
                  transition-all duration-300
                  hover:border-cyan-400/40
                  hover:bg-cyan-400/[0.06]
                  hover:text-cyan-300
                  hover:-translate-y-0.5
                "
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
                href="#"
                aria-label="Facebook"
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl
                  border border-white/[0.07]
                  bg-white/[0.025]
                  text-slate-400
                  transition-all duration-300
                  hover:border-cyan-400/40
                  hover:bg-cyan-400/[0.06]
                  hover:text-cyan-300
                  hover:-translate-y-0.5
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
                  border border-white/[0.07]
                  bg-white/[0.025]
                  text-slate-400
                  transition-all duration-300
                  hover:border-cyan-400/40
                  hover:bg-cyan-400/[0.06]
                  hover:text-cyan-300
                  hover:-translate-y-0.5
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
            <h3 className="mb-6 text-sm font-bold tracking-wide text-white">
              SẢN PHẨM
            </h3>

            <div className="space-y-4">
              <FooterLink href="/tools" text="Tất cả Tool" />
              <FooterLink href="/tools" text="Tool Auto" />
              <FooterLink href="/projects" text="Dự án" />
              <FooterLink href="/recharge" text="Nạp tiền" />
            </div>
          </div>


          {/* ================= HỖ TRỢ ================= */}
          <div>
            <h3 className="mb-6 text-sm font-bold tracking-wide text-white">
              HỖ TRỢ
            </h3>

            <div className="space-y-4">
              <FooterLink href="/guide" text="Hướng dẫn" />
              <FooterLink href="/support" text="Liên hệ" />
              <FooterLink href="#" text="Discord hỗ trợ" />
              <FooterLink href="/faq" text="Câu hỏi thường gặp" />
            </div>
          </div>


          {/* ================= CHÍNH SÁCH ================= */}
          <div>
            <h3 className="mb-6 text-sm font-bold tracking-wide text-white">
              CHÍNH SÁCH
            </h3>

            <div className="space-y-4">
              <FooterLink href="/privacy" text="Chính sách bảo mật" />
              <FooterLink href="/terms" text="Điều khoản sử dụng" />
              <FooterLink href="/refund" text="Chính sách hoàn tiền" />
              <FooterLink href="/rules" text="Quy định sử dụng" />
            </div>
          </div>

        </div>


        {/* ================= BOTTOM ================= */}
        <div className="flex flex-col gap-3 border-t border-white/[0.06] py-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © 2026{" "}
            <span className="font-semibold text-slate-500">
              ZTOOL
            </span>
            . Tất cả quyền được bảo lưu.
          </p>

          <p>
            Thiết kế bởi{" "}
            <span className="font-semibold text-cyan-400">
              ZTOOL
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
        text-sm text-slate-500
        transition-all duration-200
        hover:translate-x-1
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
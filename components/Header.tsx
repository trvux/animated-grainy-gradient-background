// "use client";

// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { useState } from "react";

// export default function Header() {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     // 1. Thẻ div bọc ngoài cùng chịu trách nhiệm định vị Floating (cách top-4, căn giữa, z-50)
//     <div className="dark fixed top-4 inset-x-0 z-50 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 font-sans">
//       {/* 2. Thanh Capsule Header chính (Dùng màu hệ thống và border mỏng hệ oklch) */}
//       <header className="bg-muted md:bg-background/10 text-foreground w-full h-14 rounded-xl border border-border/10 md:backdrop-blur-sm transition-all duration-300">
//         <div className="flex h-full items-center justify-between px-6">
//           {/* Logo */}
//           <div className="flex items-center text-lg font-bold">
//             <Link href="/">Trvux</Link>
//           </div>

//           {/* Menu Navigation (Giữa) - Ẩn trên Mobile */}
//           <nav className="hidden md:flex items-center gap-6">
//             <Link href="#solutions" className="text-sm font-medium">
//               Solutions
//             </Link>
//             <Link href="#results" className="text-sm font-medium">
//               Results
//             </Link>
//             <Link href="#process" className="text-sm font-medium">
//               Process
//             </Link>
//             <Link href="#pricing" className="text-sm font-medium">
//               Pricing
//             </Link>
//             <Link href="#faqs" className="text-sm font-medium">
//               FAQs
//             </Link>
//           </nav>

//           {/* Button CTA (Phải) - Dùng Shadcn Button */}
//           <div className="hidden md:flex items-center">
//             <Button
//               asChild
//               variant="default"
//               size="sm"
//               className="rounded-lg font-medium px-4 h-9"
//             >
//               <Link href="/contact">Get Started</Link>
//             </Button>
//           </div>

//           {/* Hamburger Mobile Button */}
//           <div className="flex md:hidden">
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => setIsOpen(!isOpen)}
//               className="text-foreground hover:text-foreground/70"
//             >
//               {isOpen ? (
//                 // Icon X đóng menu
//                 <svg
//                   className="h-5 w-5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   strokeWidth="2"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               ) : (
//                 // Icon 2 gạch ngang mảnh chuẩn đét như hình mobile của mày
//                 <svg
//                   className="h-5 w-5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   strokeWidth="2"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M3.75 9h16.5m-16.5 6h16.5"
//                   />
//                 </svg>
//               )}
//             </Button>
//           </div>
//         </div>
//       </header>

//       {/* 3. Mobile Dropdown Menu (Đổ bo góc gọn gàng ngay dưới thanh Capsule) */}
//       {isOpen && (
//         <div className="mt-2 w-full rounded-xl border border-border bg-muted backdrop-blur-lg p-4 shadow-xl md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
//           <div className="flex flex-col gap-3 text-center">
//             <Link
//               href="#solutions"
//               onClick={() => setIsOpen(false)}
//               className="rounded-md py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
//             >
//               Solutions
//             </Link>
//             <Link
//               href="#results"
//               onClick={() => setIsOpen(false)}
//               className="rounded-md py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
//             >
//               Results
//             </Link>
//             <Link
//               href="#process"
//               onClick={() => setIsOpen(false)}
//               className="rounded-md py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
//             >
//               Process
//             </Link>
//             <Link
//               href="#pricing"
//               onClick={() => setIsOpen(false)}
//               className="rounded-md py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
//             >
//               Pricing
//             </Link>
//             <Link
//               href="#faqs"
//               onClick={() => setIsOpen(false)}
//               className="rounded-md py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
//             >
//               FAQs
//             </Link>
//             <div className="mt-2 pt-2 border-t border-border/50">
//               <Button
//                 asChild
//                 variant="default"
//                 className="w-full rounded-lg h-10"
//               >
//                 <Link href="/contact" onClick={() => setIsOpen(false)}>
//                   Get Started
//                 </Link>
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="dark fixed top-4 inset-x-0 z-50 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 font-sans">
      {/* HEADER CONTAINER: transition-all duration-500 giúp toàn bộ khung co giãn mượt mà */}
      <header className="bg-muted md:bg-background/10 text-foreground w-full rounded-xl border border-border/10 md:backdrop-blur-sm transition-all duration-500 ease-in-out overflow-hidden">
        {/* Thanh Topbar cố định */}
        <div className="flex h-fit items-center justify-between px-6 py-4 md:py-2">
          {/* Logo */}
          <div className="flex items-center text-lg font-bold">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
            >
              {/* <Notches size={18} weight="bold" className="animate-pulse" /> */}
              {/* Dùng class animate-notches tự định nghĩa ở file global.css */}
              <div className="flex items-center justify-center h-4.5 animate-notches rotate-210">
                <div className="h-3 w-[2.5px] bg-current rounded-full" />
                <div className="h-full w-[2.5px] bg-current rounded-full" />
              </div>
              <span>Trvux</span>
            </Link>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#solutions"
              className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
            >
              Solutions
            </Link>
            <Link
              href="#results"
              className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
            >
              Results
            </Link>
            <Link
              href="#process"
              className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
            >
              Process
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#faqs"
              className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
            >
              FAQs
            </Link>
          </nav>

          {/* Button Desktop */}
          <div className="hidden md:flex items-center">
            <Button
              asChild
              variant="default"
              size="sm"
              className="rounded-lg font-medium px-4 h-9"
            >
              <Link href="/contact">Get Started</Link>
            </Button>
          </div>

          {/* Hamburger Button Mobile với Animation biến hình từ = thành X */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-foreground/70 active:bg-transparent hover:bg-transparent relative w-6 h-6 flex flex-col justify-center items-center gap-1.5"
            >
              {/* Thanh ngang trên */}
              <span
                className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out origin-center ${
                  isOpen ? "rotate-45 translate-y-[4px]" : ""
                }`}
              />
              {/* Thanh ngang dưới */}
              <span
                className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out origin-center ${
                  isOpen ? "-rotate-45 -translate-y-1" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        {/* MOBILE MENU THẢ XUỐNG TỪ TỪ (CSS Grid Height Animation)
            - Không dùng isOpen && nữa, giữ component luôn ở trong DOM để CSS transition hoạt động.
            - Khi đóng: grid-rows-[0fr] opacity-0 (Menu ẩn lặn mất).
            - Khi mở: grid-rows-[1fr] opacity-100 (Menu thả xuống từ từ mượt mà).
        */}
        <div
          className={`grid transition-all duration-500 ease-in-out md:hidden ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          {/* div bọc trong này bắt buộc phải có overflow-hidden để tính toán chiều cao mượt */}
          <div className="overflow-hidden">
            <div className="px-6 pb-6 pt-2 border-t border-border/5 flex flex-col gap-4 text-center">
              <Link
                href="#solutions"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-foreground hover:text-foreground/70 py-1 transition-colors"
              >
                Solutions
              </Link>
              <Link
                href="#results"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-foreground hover:text-foreground/70 py-1 transition-colors"
              >
                Results
              </Link>
              <Link
                href="#process"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-foreground hover:text-foreground/70 py-1 transition-colors"
              >
                Process
              </Link>
              <Link
                href="#pricing"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-foreground hover:text-foreground/70 py-1 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#faqs"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-foreground hover:text-foreground/70 py-1 transition-colors"
              >
                FAQs
              </Link>

              <div className="mt-2">
                <Button
                  asChild
                  variant="default"
                  className="w-full rounded-lg h-10 font-medium text-black bg-white hover:bg-gray-100"
                >
                  <Link href="/contact" onClick={() => setIsOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

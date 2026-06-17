// [src/app/page.tsx]
"use client";

import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import PricingSection from "@/components/PricingSection";
import ProcessSection from "@/components/ProcessSection";
import SplashScreen from "@/components/SplashScreen";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isScrollLocked, setIsScrollLocked] = useState(true);

  useEffect(() => {
    // 🚀 CHIÊU ĐỘC 1: Vừa vào web là tắt ngay tính năng tự động phục hồi scroll của trình duyệt
    if (
      typeof window !== "undefined" &&
      "scrollRestoration" in window.history
    ) {
      window.history.scrollRestoration = "manual";
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Hàm ép trình duyệt ghim cứng ở đỉnh, triệt tiêu hoàn toàn Layout Shift trục Y
    const handleScroll = (e: Event) => {
      if (isScrollLocked) {
        e.preventDefault();
        window.scrollTo(0, 0);
      }
    };

    if (isScrollLocked) {
      // 🚀 CHIÊU ĐỘC 2: Khóa cứng vị trí viewport kịch trần bằng JavaScript liên tục
      window.scrollTo(0, 0);
      window.addEventListener("scroll", handleScroll, { passive: false });

      // Giữ nguyên track của thanh cuộn nhưng khóa cuộn nội dung, chống sụt độ rộng màn hình (Gutter Lock)
      document.documentElement.style.maxHeight = "100vh";
      document.documentElement.style.overflow = "hidden";
    } else {
      window.removeEventListener("scroll", handleScroll);
      document.documentElement.style.maxHeight = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.documentElement.style.maxHeight = "";
      document.documentElement.style.overflow = "";
    };
  }, [isScrollLocked]);

  return (
    <main className="relative text-foreground font-sans overflow-x-hidden min-h-screen bg-background">
      {/* ─── 1. COMPONENT MÀN CHÀO HOÀN CHỈNH ─── */}
      <SplashScreen
        isLoading={isLoading}
        onAnimationComplete={() => {
          // Trả lại quyền tự do hoàn toàn cho trình duyệt SAU KHI rèm đen đã biến mất 100%
          setIsScrollLocked(false);
        }}
      />

      {/* ─── 2. TẦNG NỘI DUNG CHÍNH CỦA TRANG WEB ─── */}
      <motion.div
        // 🚀 TỐI ƯU ĐỘNG LỰC HỌC: Loại bỏ hoàn toàn thuộc tính "y: 15" ở pha initial
        // Vì khi chữ trồi lên cùng lúc nhả lock, trình duyệt dễ bị tính toán sai bounding box gây shift.
        // Chỉ dùng opacity fade-in mượt mà là cực kỳ sang và an toàn tuyệt đối.
        initial={{ opacity: 0 }}
        animate={!isLoading ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="dark"
      >
        <HeroSection />

        <div className="relative z-10 bg-background text-foreground">
          <FeaturesSection />
          <ProcessSection />
          <PricingSection />
          <Footer />
        </div>
      </motion.div>
    </main>
  );
}

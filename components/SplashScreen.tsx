// [src/components/SplashScreen/index.tsx]
"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";

interface SplashScreenProps {
  isLoading: boolean;
  onAnimationComplete: () => void;
}

// 🚀 GOM HẾT CẤU HÌNH BIẾN THIÊN RA NGOÀI COMPONENT (Clean & Tối ưu bộ nhớ)
const containerVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.08, // Mỗi chữ cái nhảy cách nhau 0.08 giây
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1, // Thu chữ cái ngược từ sau ra trước khi đóng
    },
  },
};

const letterVariants: Variants = {
  initial: {
    opacity: 0,
    y: 60, // Xuất phát chìm sâu ở dưới
    scale: 0.7,
  },
  animate: {
    opacity: 1,
    y: 0, // Trồi hẳn lên vị trí trung tâm chuẩn Spring Bounce
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 12,
      mass: 0.6,
    },
  },
  exit: {
    opacity: 0,
    y: -40, // Bắn vút lên trên khi đóng màn chào
    scale: 0.8,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

export default function SplashScreen({
  isLoading,
  onAnimationComplete,
}: SplashScreenProps) {
  const logoText = "Hello";
  const letters = Array.from(logoText);

  return (
    <AnimatePresence mode="wait" onExitComplete={onAnimationComplete}>
      {isLoading && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{
            y: "-100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
          className="dark fixed inset-0 z-9999 flex items-center justify-center bg-background touch-none pointer-events-auto"
        >
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex overflow-hidden font-bold text-3xl md:text-4xl text-foreground brightness-200 select-none"
          >
            {letters.map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className={index !== letters.length - 1 ? "mr-[0.3em]" : ""}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

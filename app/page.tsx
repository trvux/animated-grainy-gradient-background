// import FluidBackground from "@/components/FluidBackground";
// import { Button } from "@/components/ui/button";

// export default function Home() {
//   return (
//     <main className="relative  text-white  font-sans overflow-x-hidden">
//       {/* Background chạy bằng WebGL Shader siêu mượt và Framer Motion fade-in */}
//       <FluidBackground />

//       {/* Content đè lên trên background fixed */}
//       <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
//         <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl drop-shadow-lg text-slate-100">
//           Film Grain
//         </h1>
//         <p className="mt-6 text-xl text-slate-200 max-w-lg drop-shadow">
//           Film Grain / Noise Animation
//         </p>
//         <Button variant="default">Get Started</Button>
//       </div>
//     </main>
//   );
// }
// [src/app/page.tsx]
"use client";

import FluidBackground from "@/components/FluidBackground";
import { Button } from "@/components/ui/button";
import { GithubLogo, MediumLogo, Star } from "@phosphor-icons/react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative text-white font-sans overflow-x-hidden min-h-screen">
      {/* Background chạy bằng WebGL Shader siêu mượt và Framer Motion fade-in */}
      <FluidBackground />

      {/* Content đè lên trên background fixed */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 md:px-6 text-center max-w-5xl mx-auto select-none">
        {/* 1. Rating Stars & Social Proof Badge */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} weight="fill" />
            ))}
          </div>
          <span className="text-xs md:text-sm font-medium text-slate-300">
            Fluid Noise Gradient — Tranvux
          </span>
        </div>

        {/* 2. Main Heading (Font semibold sang trọng, sát chữ chuẩn Apple) */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-white max-w-4xl leading-[1.1] font-sans drop-shadow-sm">
          Next-gen generative <br className="hidden sm:inline" /> canvas shaders
        </h1>
        {/* 3. Subtitle (Dùng text-slate-300 dịu mắt, bóp max-width lại cho đẹp dòng chảy) */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed drop-shadow-sm px-2">
          A mesmerising interplay of fluid math-based noise and organic
          gradients. Engineered with high-performance WebGL to deliver an
          immersive, tactile digital atmosphere that responds gracefully to any
          screen layout.
        </p>

        {/* 4. CTA Buttons Group */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3.5 items-center justify-center w-full sm:w-auto">
          <Button
            variant="default"
            className="w-full sm:w-auto px-7 py-5 bg-white text-black font-medium text-sm rounded-lg hover:bg-slate-200 transition-all duration-200 shadow-lg"
            asChild
          >
            <Link
              // href="https://www.facebook.com/yushiyushiy"
              href="https://github.com/trvux"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubLogo icon-data="inline-start" />
              Github
            </Link>
          </Button>

          <Button
            variant="outline"
            className="w-full sm:w-auto px-7 py-5 bg-white/5 border-white/15 text-white font-medium text-sm rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 backdrop-blur-md"
            asChild
          >
            <Link
              href="https://medium.com/@Trvux115"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors duration-200"
            >
              <MediumLogo icon-data="inline-start" />
              Medium Blog
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

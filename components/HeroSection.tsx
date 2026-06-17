"use client";

import FluidBackground from "@/components/FluidBackground";
import { Button } from "@/components/ui/button";
import { GithubLogo, MediumLogo, Package } from "@phosphor-icons/react";
import Link from "next/link";

export default function HeroSection() {
  return (
    // Sử dụng h-screen cố định cho Hero để khóa chặt không gian, không cho canvas tràn hay dãn bậy bạ
    <section className="relative w-full h-screen min-h-[650px] overflow-hidden bg-black flex items-center justify-center">
      <FluidBackground />

      <div className="relative z-10 flex flex-col items-center justify-center px-4 md:px-6 text-center max-w-5xl mx-auto select-none">
        {/* Rating Stars */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-0.5">
            {[...Array(1)].map((_, i) => (
              <Package key={i} weight="bold" className="text-foreground " />
            ))}
          </div>
          <span className="text-xs md:text-sm font-medium text-foreground">
            Fluid Noise Gradient — Tranvux
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-white max-w-4xl leading-[1.1] font-sans drop-shadow-sm">
          Next-gen generative <br className="hidden sm:inline" /> canvas shaders
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed drop-shadow-sm px-2">
          A mesmerising interplay of fluid math-based noise and organic
          gradients. Engineered with high-performance WebGL to deliver an
          immersive, tactile digital atmosphere that responds gracefully to any
          screen layout.
        </p>

        {/* CTA Buttons Group */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3.5 items-center justify-center w-full sm:w-auto">
          <Button
            variant="default"
            className="w-full sm:w-auto px-7 py-5 bg-white text-black font-medium text-sm rounded-lg hover:bg-slate-200 transition-all duration-200 shadow-lg"
            asChild
          >
            <Link
              href="https://github.com/trvux"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubLogo className="w-4 h-4 mr-2 inline-block" />
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
            >
              <MediumLogo className="w-4 h-4 mr-2 inline-block" />
              Medium Blog
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

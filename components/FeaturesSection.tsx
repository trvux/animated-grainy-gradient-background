"use client";

import { Cpu, Eye, Lightning, Sliders } from "@phosphor-icons/react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <Lightning className="w-6 h-6 text-foreground" />, // Ăn theo biến màu chữ hệ thống
      title: "60 FPS Performance",
      description:
        "Engineered with native WebGL2 pipelines, ensuring silky-smooth frame rates without choking the main thread.",
      className: "md:col-span-2",
    },
    {
      icon: <Sliders className="w-6 h-6 text-foreground" />,
      title: "Dynamic Control",
      description:
        "Exposes raw shader uniforms directly via an elegant, reactive debug panel.",
      className: "md:col-span-1",
    },
    {
      icon: <Cpu className="w-6 h-6 text-foreground" />,
      title: "Math-Based Noise",
      description:
        "Pure mathematical algorithms generating organic fluid motion without heavy image assets.",
      className: "md:col-span-1",
    },
    {
      icon: <Eye className="w-6 h-6 text-foreground" />,
      title: "Retina Sharpness",
      description:
        "Automatically adapts to high-DPR screens, maintaining high-fidelity grain and contrast on every display layout.",
      className: "md:col-span-2",
    },
  ];

  return (
    // Đổi bg-black thành bg-background để lấy màu nền trắng tinh khôi của :root
    // Đổi border-white/5 thành border-border chuẩn Shadcn
    <section className="py-24 px-4 md:px-6 max-w-6xl mx-auto bg-background border-t border-border">
      <div className="text-center max-w-2xl mx-auto mb-16">
        {/* Đổi text-white thành text-foreground (Chữ đen thùi lùi) */}
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground">
          Architected for fluidity.
        </h2>
        {/* Đổi text-slate-400 thành text-muted-foreground */}
        <p className="mt-4 text-muted-foreground font-light text-base md:text-lg">
          A granular breakdown of the tech stack powering the immersive digital
          atmosphere.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <div
            key={i}
            className={`p-8 rounded-xl bg-card text-card-foreground border border-border backdrop-blur-sm flex flex-col justify-between group hover:border-neutral-400 transition-colors duration-300 ${f.className}`}
          >
            <div>
              {/* Box bọc icon: đổi nền thành bg-muted để có màu xám nhẹ sang chảnh */}
              <div className="p-3 bg-muted border border-border rounded-lg w-fit mb-6">
                {f.icon}
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">
                {f.title}
              </h3>
              <p className="text-muted-foreground font-light text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

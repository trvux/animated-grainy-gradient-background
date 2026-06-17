"use client";

export default function ProcessSection() {
  const steps = [
    {
      num: "01",
      name: "Inject Shader",
      desc: "Embed the WebGL2 canvas compiler into your Next.js tree node.",
    },
    {
      num: "02",
      name: "Tune Uniforms",
      desc: "Use our corporate controller panel to fine-tune noise wave ripples.",
    },
    {
      num: "03",
      name: "Deploy Global",
      desc: "Production-ready code optimized for edge hosting platforms.",
    },
  ];

  return (
    // Đổi toàn bộ màu fix cứng sang bg-background, text-foreground và border-border
    <section className="py-24 px-4 md:px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 bg-background border-t border-border items-center">
      <div>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
          From matrix math <br /> to production.
        </h2>
        <p className="mt-6 text-muted-foreground font-light text-base md:text-lg max-w-md">
          Zero external image layers. Just raw GPU pipelines rendering
          interactive vector algorithms directly into the DOM tree.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex gap-6 border-b border-border pb-6 last:border-none"
          >
            {/* Màu số bước chân đổi sang text-muted-foreground/60 cho tinh tế */}
            <span className="font-mono text-sm text-muted-foreground/60 font-bold tracking-wider pt-1">
              {s.num}
            </span>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                {s.name}
              </h3>
              <p className="text-muted-foreground font-light text-sm leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Check } from "@phosphor-icons/react";

export default function PricingSection() {
  return (
    <section className="py-24 px-4 md:px-6 max-w-5xl mx-auto bg-background border-t border-border">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground">
          Transparent licensing.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Tier 1 - Standard Card */}
        <div className="p-8 rounded-xl bg-card text-card-foreground border border-border flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium text-muted-foreground">
              Standard License
            </h3>
            <div className="mt-4 flex items-baseline text-foreground">
              <span className="text-4xl font-semibold tracking-tight">$0</span>
              <span className="ml-1 text-sm font-light text-muted-foreground">
                / forever
              </span>
            </div>
            <p className="mt-4 text-muted-foreground text-xs font-light">
              Perfect for personal portfolios or open-source testing.
            </p>

            <ul className="mt-8 space-y-3.5 text-sm font-light text-foreground">
              <li className="flex items-center gap-2.5">
                <Check className="text-foreground w-4 h-4" /> WebGL2 Fluid
                Source Code
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="text-foreground w-4 h-4" /> Standard Controls
                Config
              </li>
            </ul>
          </div>
          {/* Nút bấm tự ăn theo theme light mặc định của Shadcn */}
          <Button
            variant="outline"
            className="w-full mt-8 h-10 text-xs font-medium"
          >
            Clone Repository
          </Button>
        </div>

        {/* Tier 2 - Commercial Pro (Nổi bật nhẹ bằng nền bg-muted/40 tinh tế) */}
        <div className="p-8 rounded-xl bg-muted/40 border border-border flex flex-col justify-between relative shadow-sm">
          <div className="absolute top-4 right-4 bg-foreground/10 border border-border text-foreground font-mono text-[10px] uppercase px-2 py-0.5 rounded-full tracking-wider font-semibold">
            Commercial
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">
              Commercial Pro
            </h3>
            <div className="mt-4 flex items-baseline text-foreground">
              <span className="text-4xl font-semibold tracking-tight">$49</span>
              <span className="ml-1 text-sm font-light text-muted-foreground">
                / one-time
              </span>
            </div>
            <p className="mt-4 text-muted-foreground text-xs font-light">
              For agency work, client websites, and SaaS backdrops.
            </p>

            <ul className="mt-8 space-y-3.5 text-sm font-light text-foreground">
              <li className="flex items-center gap-2.5">
                <Check className="text-foreground w-4 h-4" /> Everything in
                Standard
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="text-foreground w-4 h-4" /> Multi-project
                Commercial License
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="text-foreground w-4 h-4" /> Premium Shader
                Presets (.json)
              </li>
            </ul>
          </div>
          <Button
            variant="default"
            className="w-full mt-8 h-10 text-xs font-medium"
          >
            Get Pro Access
          </Button>
        </div>
      </div>
    </section>
  );
}

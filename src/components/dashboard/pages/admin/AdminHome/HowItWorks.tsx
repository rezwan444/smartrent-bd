"use client";

import { Search, Sliders, CheckSquare } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: Search,
      title: "Select Location or Campus Hub",
      desc: "Choose your preferred student area in Dhaka (Banasree, Mirpur, Farmgate, Uttara) or Bogura (Satmatha, Joleshwaritola, Azizul Haque College).",
    },
    {
      num: "02",
      icon: Sliders,
      title: "Filter by Budget & Key Amenities",
      desc: "Narrow down listings by monthly rent range, attached bathroom, high-speed Wi-Fi, generator backup, or kitchen access.",
    },
    {
      num: "03",
      icon: CheckSquare,
      title: "Verify & Move In With Confidence",
      desc: "Review transparent photos and details, schedule an in-person viewing with the owner or manager, and finalize your stay safely.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-12 sm:py-16 bg-background border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
            How SmartRent BD Works
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Find student and bachelor accommodation in 3 simple steps without broker fees or misleading posts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-card border border-border rounded-xs p-5 relative flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-xs font-mono font-bold text-accent bg-background px-2 py-0.5 rounded-xs border border-border">
                      Step {step.num}
                    </span>
                    <div className="w-7 h-7 rounded-xs bg-secondary text-primary flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-foreground mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

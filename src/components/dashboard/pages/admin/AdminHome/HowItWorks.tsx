"use client";

import { Search, Sliders, CheckSquare } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "০১",
      icon: Search,
      title: "আপনার এলাকা বা ক্যাম্পাস নির্বাচন করুন",
      desc: "ঢাকা (ফার্মগেট, বনশ্রী, মিরপুর, উত্তরা) কিংবা বগুড়া (সাতমাথা, জলেশ্বরীতলা, আযীযুল হক কলেজ) থেকে আপনার পছন্দের এলাকা বেছে নিন।",
    },
    {
      num: "০২",
      icon: Sliders,
      title: "বাজেট ও জরুরি সুবিধা ফিল্টার করুন",
      desc: "মেস সিট বা রুমের মাসিক ভাড়ার পরিধি এবং ওয়াইফাই, অ্যাটাচড ওয়াশরুম, জেনারেটর বা রান্নার সুবিধার ভিত্তিতে ফলাফল সংকুচিত করুন।",
    },
    {
      num: "০৩",
      icon: CheckSquare,
      title: "সরেজমিনে যাচাই করে রুম চূড়ান্ত করুন",
      desc: "বিজ্ঞাপনের তথ্য ও ছবি দেখে বাড়িওয়ালা বা মেস ম্যানেজারের সাথে সরাসরি যোগাযোগ করে রুম পরিদর্শন করুন ও নিরাপদে উঠুন।",
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
            স্মার্টরেন্ট বিডি কিভাবে কাজ করে?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            ফেসবুক গ্রুপের অস্পষ্ট পোস্ট বা দালালের ঝামেলা ছাড়াই সহজে মেস ও বাসা খোঁজার ৩টি সহজ ধাপ।
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
                      ধাপ {step.num}
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

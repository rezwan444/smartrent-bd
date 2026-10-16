"use client";

import { Users, Sparkles, Shield, UserCheck } from "lucide-react";
import Link from "next/link";

export function RoommateTeaser() {
  return (
    <section
      id="roommates"
      className="py-12 sm:py-16 bg-background border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-border bg-card p-6 sm:p-8 rounded-xs">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-secondary text-primary text-[11px] font-bold uppercase tracking-wider mb-3 border border-primary/20">
              <Sparkles className="w-3 h-3" />
              <span>রুমমেট ম্যাচিং ফিচার (Under Development)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              পড়াশোনা ও অভ্যাসের সাথে মিল রেখে রুমমেট খুঁজুন
            </h2>

            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              মেস বা সাবলেটে ভুল মানুষের সাথে থাকা মানসিক অশান্তির কারণ হতে পারে। স্মার্টরেন্ট বিডি তৈরি করছে ব্যাখ্যাযোগ্য রুমমেট ম্যাচিং ব্যবস্থা—যেখানে ঘুমানোর সময়, পড়ার রুটিন, পরিষ্কার-পরিচ্ছন্নতা এবং মিল সিস্টেম পছন্দ যাচাই করে তবেই যোগাযোগের সুযোগ মিলবে।
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-border">
            <div className="space-y-1.5 p-3.5 bg-background border border-border rounded-xs">
              <div className="w-7 h-7 rounded-xs bg-secondary text-primary flex items-center justify-center mb-1.5">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                দৈনন্দিন অভ্যাসের তুলনা
              </h3>
              <p className="text-xs text-muted-foreground leading-normal">
                ঘুম থেকে ওঠার সময়, পড়াশোনার নীরবতা ও মেহমান আসার বিষয়ে আগে থেকেই স্পষ্ট ধারণা পাবেন।
              </p>
            </div>

            <div className="space-y-1.5 p-3.5 bg-background border border-border rounded-xs">
              <div className="w-7 h-7 rounded-xs bg-secondary text-primary flex items-center justify-center mb-1.5">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                উভয়পক্ষের সম্মতিতে যোগাযোগ
              </h3>
              <p className="text-xs text-muted-foreground leading-normal">
                দুই পক্ষই পরিচিত হতে সম্মতি দিলে তবেই মোবাইল নম্বর বা ফেসবুক প্রোফাইল শেয়ার করা হবে।
              </p>
            </div>

            <div className="space-y-1.5 p-3.5 bg-background border border-border rounded-xs">
              <div className="w-7 h-7 rounded-xs bg-secondary text-primary flex items-center justify-center mb-1.5">
                <UserCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                ছাত্রত্ব ও পরিচয় যাচাই
              </h3>
              <p className="text-xs text-muted-foreground leading-normal">
                কলেজ বা বিশ্ববিদ্যালয়ের আইডি কার্ডের মাধ্যমে যাচাইকৃত প্রোফাইল পারস্পরিক নিরাপত্তা নিশ্চিত করে।
              </p>
            </div>
          </div>

          <div className="mt-7 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              ফিচারটি উন্মুক্ত হলে নোটিফিকেশন পেতে চান?
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors cursor-pointer"
            >
              প্রি-রেজিস্ট্রেশন করুন
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

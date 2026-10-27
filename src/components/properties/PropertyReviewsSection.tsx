"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hook";
import { toast } from "sonner";
import {
  Star,
  ShieldCheck,
  ShieldAlert,
  MessageSquarePlus,
  Lock,
  Calendar,
  Sparkles,
  UserCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { IProperty } from "@/types/property";
import { PropertyReview, PropertyRatingSummary, TenantEligibilityResult } from "@/types/review";
import StarRating from "@/utils/StarRating";
import {
  loadPropertyReviews,
  getPropertyRatingSummary,
  checkTenantEligibility,
  submitPropertyReview,
  REVIEWS_UPDATED_EVENT,
} from "@/lib/propertyReviewStorage";

interface PropertyReviewsSectionProps {
  property: IProperty;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor - Significant issues",
  2: "Fair - Needs improvement",
  3: "Good - Meets expectations",
  4: "Very Good - Highly satisfied",
  5: "Excellent - Outstanding student stay",
};

export function PropertyReviewsSection({ property }: PropertyReviewsSectionProps) {
  const reduxUser = useAppSelector((state) => state.auth.user);

  // Reviews and summary state
  const [reviews, setReviews] = useState<PropertyReview[]>(() =>
    loadPropertyReviews(property.id)
  );
  const [summary, setSummary] = useState<PropertyRatingSummary>(() =>
    getPropertyRatingSummary(property.id)
  );
  const [eligibility, setEligibility] = useState<TenantEligibilityResult>(() =>
    checkTenantEligibility(
      reduxUser
        ? {
            id: reduxUser.id,
            email: reduxUser.email,
            role: reduxUser.role as string,
          }
        : null,
      property.id
    )
  );

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [cleanliness, setCleanliness] = useState<number>(5);
  const [landlordBehavior, setLandlordBehavior] = useState<number>(5);
  const [safety, setSafety] = useState<number>(5);
  const [facilities, setFacilities] = useState<number>(5);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter/Sort state
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");

  // Sync when event fires or auth user changes
  useEffect(() => {
    const handleUpdate = () => {
      setReviews(loadPropertyReviews(property.id));
      setSummary(getPropertyRatingSummary(property.id));
      setEligibility(
        checkTenantEligibility(
          reduxUser
            ? {
                id: reduxUser.id,
                email: reduxUser.email,
                role: reduxUser.role as string,
              }
            : null,
          property.id
        )
      );
    };

    handleUpdate();
    window.addEventListener(REVIEWS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(REVIEWS_UPDATED_EVENT, handleUpdate);
  }, [property.id, reduxUser]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!reduxUser) {
      setFormError("Please sign in to submit a review.");
      toast.error("Authentication required.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setFormError("Please select a star rating between 1 and 5.");
      return;
    }

    if (comment.trim().length < 10) {
      setFormError("Review comments must be at least 10 characters long.");
      return;
    }

    setIsSubmitting(true);

    const userName =
      `${reduxUser.firstName || ""} ${reduxUser.lastName || ""}`.trim() ||
      "Verified Student Tenant";

    const result = submitPropertyReview({
      propertyId: property.id,
      userId: reduxUser.id,
      userName,
      userEmail: reduxUser.email,
      userAvatar: reduxUser.profilePictureUrl || undefined,
      userRole: reduxUser.role as string,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      subRatings: {
        cleanliness,
        landlordBehavior,
        safety,
        facilities,
      },
    });

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error || "Failed to submit review.");
      toast.error(result.error || "Submission failed.");
      return;
    }

    toast.success("Thank you! Your verified tenant review has been published.");
    setTitle("");
    setComment("");
    setIsFormOpen(false);
  };

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest") return a.rating - b.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <section
      id="reviews"
      aria-label="Tenant Ratings & Reviews"
      className="bg-card border border-border rounded-xs p-5 sm:p-6 space-y-6 shadow-2xs scroll-mt-20"
    >
      {/* 1. Header with Title and Trust Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold font-heading text-foreground">
              Tenant Ratings & Verified Reviews
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-semibold uppercase bg-secondary text-primary border border-primary/20">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span>Verified Only</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Authentic feedback exclusively from verified students and tenants with confirmed rental records.
          </p>
        </div>

        {/* Write a review toggle button (if eligible) */}
        {eligibility.isEligible && !isFormOpen && (
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Tenant Review</span>
          </button>
        )}
      </div>

      {/* 2. Rating Summary Overview (Scorecard + Distribution + Sub-ratings) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 sm:p-5 rounded-xs bg-background border border-border">
        {/* Left: Overall Big Score */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-border text-center space-y-2">
          <div className="text-4xl sm:text-5xl font-extrabold font-heading text-foreground tabular-nums">
            {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : "—"}
          </div>
          <StarRating rating={summary.averageRating} size="md" />
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-foreground">
              {summary.totalReviews > 0
                ? `${summary.totalReviews} Verified Review${summary.totalReviews > 1 ? "s" : ""}`
                : "No reviews recorded yet"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Track C3 Feature 7 • Authenticated Tenants
            </p>
          </div>
        </div>

        {/* Center: Star Rating Breakdown Bars */}
        <div className="md:col-span-4 flex flex-col justify-center space-y-2 py-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Rating Distribution
          </span>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.distribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
            const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="w-7 text-muted-foreground font-mono flex items-center gap-0.5 shrink-0">
                  <span>{stars}</span>
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-secondary/60 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-6 text-right text-muted-foreground tabular-nums text-[11px] shrink-0">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Sub-ratings Averages */}
        <div className="md:col-span-4 flex flex-col justify-center space-y-2.5 py-1 border-t md:border-t-0 md:border-l border-border md:pl-5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
            Accommodation Criteria
          </span>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Safety & Security</span>
              <span className="font-bold text-foreground tabular-nums">
                {summary.subRatingAverages?.safety
                  ? `${summary.subRatingAverages.safety.toFixed(1)} / 5`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Landlord Behavior</span>
              <span className="font-bold text-foreground tabular-nums">
                {summary.subRatingAverages?.landlordBehavior
                  ? `${summary.subRatingAverages.landlordBehavior.toFixed(1)} / 5`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cleanliness & Hygiene</span>
              <span className="font-bold text-foreground tabular-nums">
                {summary.subRatingAverages?.cleanliness
                  ? `${summary.subRatingAverages.cleanliness.toFixed(1)} / 5`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Utilities & Wi-Fi</span>
              <span className="font-bold text-foreground tabular-nums">
                {summary.subRatingAverages?.facilities
                  ? `${summary.subRatingAverages.facilities.toFixed(1)} / 5`
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Verified Tenant Eligibility Callout / Submission Section */}
      <div className="space-y-4">
        {eligibility.hasAlreadyReviewed ? (
          /* State A: User has already submitted a review */
          <div className="p-4 rounded-xs bg-secondary/40 border border-primary/20 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>You have submitted a verified review for this property</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Thank you for contributing to SmartRent BD&apos;s transparent student rental network. To protect against score manipulation, each verified tenant may submit one review per accommodation.
            </p>
          </div>
        ) : eligibility.isEligible ? (
          /* State B: User is an eligible verified tenant */
          <div className="space-y-4">
            {!isFormOpen ? (
              <div className="p-4 rounded-xs bg-secondary/40 border border-primary/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      Verified Tenant Confirmed ({eligibility.tenancyRecord?.roomOrUnit || "Active Agreement"})
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Our records confirm your tenancy agreement for this accommodation. Share your rating and experience with fellow students.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Rate this Accommodation</span>
                </button>
              </div>
            ) : (
              /* Review Submission Form */
              <form
                onSubmit={handleSubmitReview}
                className="p-5 sm:p-6 rounded-xs bg-card border border-primary/30 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Submit Your Verified Tenant Review</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Posting as <strong className="text-foreground">{reduxUser?.firstName} {reduxUser?.lastName}</strong> ({eligibility.tenancyRecord?.roomOrUnit})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {formError && (
                  <div className="p-3 rounded-xs bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Overall Star Rating Input */}
                <div className="space-y-1.5 bg-background p-3.5 rounded-xs border border-border">
                  <label className="text-xs font-bold text-foreground block">
                    Overall Experience Rating <span className="text-destructive">*</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <StarRating
                      rating={rating}
                      size="md"
                      interactive
                      onRatingChange={(newRating) => setRating(newRating)}
                    />
                    <span className="text-xs font-semibold text-primary">
                      {RATING_LABELS[rating] || `${rating} Stars`}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Click any star (1–5) to set your rating.
                  </p>
                </div>

                {/* Sub-ratings Grid */}
                <div className="space-y-2 bg-background p-3.5 rounded-xs border border-border">
                  <label className="text-xs font-bold text-foreground block">
                    Detailed Accommodation Criteria (1–5 Stars)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xs border border-border/60 bg-card">
                      <span className="text-muted-foreground">Safety & Security:</span>
                      <StarRating
                        rating={safety}
                        size="sm"
                        interactive
                        onRatingChange={setSafety}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xs border border-border/60 bg-card">
                      <span className="text-muted-foreground">Landlord Behavior:</span>
                      <StarRating
                        rating={landlordBehavior}
                        size="sm"
                        interactive
                        onRatingChange={setLandlordBehavior}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xs border border-border/60 bg-card">
                      <span className="text-muted-foreground">Cleanliness & Hygiene:</span>
                      <StarRating
                        rating={cleanliness}
                        size="sm"
                        interactive
                        onRatingChange={setCleanliness}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xs border border-border/60 bg-card">
                      <span className="text-muted-foreground">Utilities & Facilities:</span>
                      <StarRating
                        rating={facilities}
                        size="sm"
                        interactive
                        onRatingChange={setFacilities}
                      />
                    </div>
                  </div>
                </div>

                {/* Review Headline/Title (Optional) */}
                <div className="space-y-1.5">
                  <label htmlFor="review-title" className="text-xs font-semibold text-foreground">
                    Review Headline (Optional)
                  </label>
                  <input
                    id="review-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Peaceful study room, helpful landlord during exams"
                    maxLength={100}
                    className="w-full h-10 px-3 text-xs bg-background border border-border rounded-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Written Review Textarea (Mandatory) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="review-comment" className="text-xs font-semibold text-foreground">
                      Written Review & Comments <span className="text-destructive">*</span>
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      {comment.trim().length}/10 min characters
                    </span>
                  </div>
                  <textarea
                    id="review-comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe the noise level, water/gas reliability, security, Wi-Fi speed, and how issues are handled..."
                    className="w-full p-3 text-xs bg-background border border-border rounded-xs focus:ring-1 focus:ring-primary outline-none resize-none leading-relaxed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Your verified review will be displayed publicly with a &ldquo;Verified Tenant&rdquo; trust badge to assist prospective student renters.
                  </p>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || comment.trim().length < 10}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Publishing..." : "Publish Verified Review"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : !eligibility.isLoggedIn ? (
          /* State C: Unauthenticated visitor */
          <div className="p-4 rounded-xs bg-background border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  Verified Tenant Review Requirement
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                To prevent fake reviews, only student tenants with confirmed rental agreements on SmartRent BD can post ratings. Please sign in to check your eligibility.
              </p>
            </div>
            <Link
              href={`/login?redirect=/properties/${property.id}`}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary bg-secondary hover:bg-secondary/80 border border-primary/20 rounded-xs transition-colors shrink-0 shadow-2xs"
            >
              <span>Sign In to Review</span>
            </Link>
          </div>
        ) : eligibility.isOwnerOrAdmin ? (
          /* State D: Owner / Admin role */
          <div className="p-3.5 rounded-xs bg-background border border-border flex items-center gap-2.5 text-xs text-muted-foreground">
            <Building className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>
              You are signed in as a Property Owner / Administrator. Tenant review submissions are reserved for verified student residents.
            </span>
          </div>
        ) : (
          /* State E: Logged in student, but NOT a tenant of this specific property */
          <div className="p-4 rounded-xs bg-background border border-border space-y-2">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  Verified Tenancy Required
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our system verifies that you do not have an active or completed rental agreement recorded for <strong className="text-foreground">{property.title}</strong>.
                </p>
                <div className="p-2.5 rounded-xs bg-secondary/30 border border-border text-[11px] text-muted-foreground flex items-center gap-2 mt-2">
                  <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    <strong>Track C3 Tenancy Policy:</strong> In-person visit requests alone do not confer review eligibility. Only confirmed rental agreements establish verified tenant status.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Tenant Feedback ({sortedReviews.length})
        </h3>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] text-muted-foreground">Sort:</span>
          <div className="inline-flex rounded-xs border border-border p-0.5 bg-background text-xs">
            <button
              type="button"
              onClick={() => setSortBy("newest")}
              className={`px-2.5 py-1 rounded-2xs font-medium transition-colors cursor-pointer ${
                sortBy === "newest"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => setSortBy("highest")}
              className={`px-2.5 py-1 rounded-2xs font-medium transition-colors cursor-pointer ${
                sortBy === "highest"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Highest
            </button>
            <button
              type="button"
              onClick={() => setSortBy("lowest")}
              className={`px-2.5 py-1 rounded-2xs font-medium transition-colors cursor-pointer ${
                sortBy === "lowest"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Lowest
            </button>
          </div>
        </div>
      </div>

      {/* 5. Reviews List */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="p-8 text-center rounded-xs bg-background border border-dashed border-border space-y-2">
            <Star className="w-8 h-8 text-muted-foreground/30 mx-auto" />
            <p className="text-xs font-semibold text-foreground">No tenant reviews yet</p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Be the first verified student tenant to share your stay experience once your rental agreement begins.
            </p>
          </div>
        ) : (
          sortedReviews.map((rev) => (
            <article
              key={rev.id}
              className="p-4 sm:p-5 rounded-xs bg-background border border-border space-y-3 shadow-2xs"
            >
              {/* Reviewer Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0 border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        rev.userAvatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                          rev.userName
                        )}`
                      }
                      alt={rev.userName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">
                        {rev.userName}
                      </h4>
                      {rev.isVerifiedTenant && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10px] font-semibold bg-secondary text-primary border border-primary/20">
                          <ShieldCheck className="w-3 h-3 text-primary" />
                          <span>Verified Tenant</span>
                        </span>
                      )}
                    </div>
                    {rev.tenancyDetails && (
                      <p className="text-[11px] text-muted-foreground">
                        {rev.tenancyDetails}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-start text-[11px] text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <time dateTime={rev.createdAt}>
                    {new Date(rev.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
              </div>

              {/* Rating and Title */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <StarRating rating={rev.rating} size="sm" showValue />
                  {rev.title && (
                    <h5 className="text-xs sm:text-sm font-bold text-foreground font-heading">
                      {rev.title}
                    </h5>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {rev.comment}
                </p>
              </div>

              {/* Sub-ratings Pills */}
              {rev.subRatings && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                  {rev.subRatings.safety && (
                    <span className="px-2 py-0.5 rounded-xs bg-card border border-border">
                      Safety: <strong className="text-foreground">{rev.subRatings.safety}/5</strong>
                    </span>
                  )}
                  {rev.subRatings.landlordBehavior && (
                    <span className="px-2 py-0.5 rounded-xs bg-card border border-border">
                      Landlord: <strong className="text-foreground">{rev.subRatings.landlordBehavior}/5</strong>
                    </span>
                  )}
                  {rev.subRatings.cleanliness && (
                    <span className="px-2 py-0.5 rounded-xs bg-card border border-border">
                      Cleanliness: <strong className="text-foreground">{rev.subRatings.cleanliness}/5</strong>
                    </span>
                  )}
                  {rev.subRatings.facilities && (
                    <span className="px-2 py-0.5 rounded-xs bg-card border border-border">
                      Utilities: <strong className="text-foreground">{rev.subRatings.facilities}/5</strong>
                    </span>
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

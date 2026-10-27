import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { Review } from "@/models/Review";
import { getAuthenticatedUser } from "@/lib/auth-server";
import type { ApiResponse } from "@/types/backend";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  comment: z.string().trim().min(10, "Comment must be at least 10 characters"),
  cleanliness: z.number().int().min(1).max(5).default(5),
  landlordBehavior: z.number().int().min(1).max(5).default(5),
  safety: z.number().int().min(1).max(5).default(5),
  facilities: z.number().int().min(1).max(5).default(5),
});

export async function GET(req: NextRequest, context: RouteContext) {
  const timestamp = new Date().toISOString();
  const { id } = await context.params;

  try {
    await connectToDatabase();

    const reviews = await Review.find({ propertyId: id }).sort({ createdAt: -1 }).lean();

    const total = reviews.length;
    const avgRating = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;
      distribution[star] = (distribution[star] || 0) + 1;
    }

    const subRatingAverages = {
      cleanliness:
        total > 0
          ? Number((reviews.reduce((s, r) => s + (r.subRatings?.cleanliness || 5), 0) / total).toFixed(1))
          : 5,
      landlordBehavior:
        total > 0
          ? Number(
              (reviews.reduce((s, r) => s + (r.subRatings?.landlordBehavior || 5), 0) / total).toFixed(1)
            )
          : 5,
      safety:
        total > 0
          ? Number((reviews.reduce((s, r) => s + (r.subRatings?.safety || 5), 0) / total).toFixed(1))
          : 5,
      facilities:
        total > 0
          ? Number((reviews.reduce((s, r) => s + (r.subRatings?.facilities || 5), 0) / total).toFixed(1))
          : 5,
    };

    const response: ApiResponse<{
      reviews: unknown[];
      summary: {
        propertyId: string;
        averageRating: number;
        totalReviews: number;
        distribution: Record<1 | 2 | 3 | 4 | 5, number>;
        subRatingAverages: {
          cleanliness: number;
          landlordBehavior: number;
          safety: number;
          facilities: number;
        };
      };
    }> = {
      success: true,
      data: {
        reviews: reviews.map((r) => ({
          ...r,
          id: String(r._id),
          _id: String(r._id),
        })),
        summary: {
          propertyId: id,
          averageRating: Number(avgRating.toFixed(1)),
          totalReviews: total,
          distribution,
          subRatingAverages,
        },
      },
      timestamp,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("[Property Reviews GET Error]:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch property reviews.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const timestamp = new Date().toISOString();
  const { id } = await context.params;

  const auth = await getAuthenticatedUser(req);
  if (!auth.isAuthenticated || !auth.user) {
    const response: ApiResponse = {
      success: false,
      error: "Unauthorized: Please sign in to write a review.",
      timestamp,
    };
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      const response: ApiResponse = {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(". "),
        timestamp,
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectToDatabase();

    // Check for duplicate review by same user on same property
    const existing = await Review.findOne({
      propertyId: id,
      userId: auth.user._id,
    });

    if (existing) {
      const response: ApiResponse = {
        success: false,
        error: "You have already submitted a review for this property.",
        timestamp,
      };
      return NextResponse.json(response, { status: 409 });
    }

    const data = parsed.data;
    const newReview = new Review({
      propertyId: id,
      userId: auth.user._id,
      userName: auth.user.fullName || "Verified Student",
      userAvatar: auth.user.avatar || null,
      userRole: "Verified Resident",
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      subRatings: {
        cleanliness: data.cleanliness,
        landlordBehavior: data.landlordBehavior,
        safety: data.safety,
        facilities: data.facilities,
      },
      isVerifiedTenant: true,
      tenancyStatus: "active",
    });

    await newReview.save();

    const response: ApiResponse<{ reviewId: string }> = {
      success: true,
      message: "Review submitted successfully! Thank you for sharing verified feedback.",
      data: { reviewId: String(newReview._id) },
      timestamp,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("[Property Review POST Error]:", err);
    const response: ApiResponse = {
      success: false,
      error: "Failed to submit review.",
      timestamp,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

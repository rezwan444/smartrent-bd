import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { PropertyDetailsClient } from "@/components/properties/PropertyDetailsClient";
import { getPropertyById, getAllPropertyIds } from "@/data/mockProperties";
import { connectToDatabase } from "@/lib/mongodb";
import { Property, formatPropertyForPublic } from "@/models/Property";
import { User } from "@/models/User";
import { verifyAccessToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import type { IProperty } from "@/types/property";
import { Home, Search, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

async function resolveProperty(id: string): Promise<IProperty | null> {
  try {
    await connectToDatabase();
    const orConditions: Array<Record<string, unknown>> = [
      { customId: id },
      { slug: id },
    ];
    if (mongoose.Types.ObjectId.isValid(id)) {
      orConditions.push({ _id: id });
    }
    const dbProp = await Property.findOne({ $or: orConditions }).lean();

    if (dbProp) {
      if (dbProp.ownerId) {
        try {
          const ownerUser = await User.findById(dbProp.ownerId)
            .select("fullName email phone avatar nidVerified isVerified createdAt")
            .lean();
          if (ownerUser) {
            dbProp.owner = {
              name: ownerUser.fullName || dbProp.owner?.name || "Verified Landlord",
              role: dbProp.type === "mess" ? "Property Manager" : "Landlord",
              isVerified: Boolean(ownerUser.nidVerified || ownerUser.isVerified || dbProp.isVerified),
              memberSince: ownerUser.createdAt
                ? new Date(ownerUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                : "2024",
              responseTime: "Within 30 mins",
              phone: ownerUser.phone || dbProp.owner?.phone || "+880 1712-345678",
            };
          }
        } catch {
          // Ignore user lookup error
        }
      }

      const isPublic = dbProp.status === "verified" && !dbProp.isHiddenFromSearch;

      if (isPublic) {
        return JSON.parse(JSON.stringify(formatPropertyForPublic(dbProp))) as unknown as IProperty;
      }

      // If not public (pending, rejected, or hidden), check if caller is owner or admin
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
        if (token) {
          const payload = verifyAccessToken(token);
          if (payload) {
            const isOwner = dbProp.ownerId && String(dbProp.ownerId) === String(payload.userId);
            const isAdmin = payload.role === "ADMIN" || payload.role === "SUPER_ADMIN" || payload.role === "STAFF";
            if (isOwner || isAdmin) {
              return JSON.parse(JSON.stringify(formatPropertyForPublic(dbProp))) as unknown as IProperty;
            }
          }
        }
      } catch {
        // Cookie access error
      }

      // Public visitor cannot access unapproved, rejected, or hidden listings
      return null;
    }
  } catch {
    // Database connection or query failed; fall through to mock registry
  }

  const mock = getPropertyById(id);
  return mock ? (JSON.parse(JSON.stringify(mock)) as IProperty) : null;
}

export async function generateStaticParams() {
  const ids = getAllPropertyIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await resolveProperty(id);

  if (!property) {
    return {
      title: "Property Not Found | SmartRent BD",
      description: "The requested rental listing is no longer available.",
    };
  }

  const rentText = `৳ ${property.rent.toLocaleString("en-US")}/mo`;
  const locationText = `${property.location.neighborhood}, ${property.location.city}`;

  return {
    title: `${property.title} | ${rentText} in ${locationText} — SmartRent BD`,
    description: property.description.slice(0, 160),
    openGraph: {
      title: `${property.title} — SmartRent BD`,
      description: `${property.type.toUpperCase()} available in ${locationText} for ${rentText}. Verified listings, zero broker fees.`,
      images: [
        {
          url: property.featuredImage,
          width: 1200,
          height: 800,
          alt: property.title,
        },
      ],
    },
  };
}

export default async function PropertyPage({ params }: PageProps) {
  const { id } = await params;
  const property = await resolveProperty(id);

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-secondary text-primary mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Error 404 &bull; Listing Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
            We couldn&apos;t find listing &ldquo;{id}&rdquo;
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            The rental accommodation you are looking for may have been rented out, unlisted by the landlord, or is awaiting administrator verification.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/properties"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Explore Available Listings</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium text-foreground bg-background hover:bg-secondary/40 border border-border rounded-xs transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    );
  }

  const plainProperty = JSON.parse(JSON.stringify(property)) as IProperty;
  return <PropertyDetailsClient property={plainProperty} />;
}

import { connectToDatabase } from "./mongodb.ts";
import { Property } from "../models/Property.ts";
import { MOCK_PROPERTIES } from "../data/mockProperties.ts";

export interface SeedResult {
  success: boolean;
  seeded: number;
  updated: number;
  total: number;
  error?: string;
}

/**
 * Safely imports existing mock properties into MongoDB Atlas without duplicates.
 * Upserts based on `slug` or `customId`.
 */
export async function seedPropertiesDatabase(): Promise<SeedResult> {
  try {
    await connectToDatabase();

    let seeded = 0;
    let updated = 0;

    for (const mock of MOCK_PROPERTIES) {
      const filter = {
        $or: [{ slug: mock.slug }, { customId: mock.id }],
      };

      const existing = await Property.findOne(filter);

      const propertyData = {
        customId: mock.id,
        title: mock.title,
        titleBangla: mock.titleBangla,
        slug: mock.slug,
        type: mock.type,
        location: {
          neighborhood: mock.location.neighborhood,
          neighborhoodBangla: mock.location.neighborhoodBangla,
          city: mock.location.city,
          cityBangla: mock.location.cityBangla,
          address: mock.location.address,
          addressBangla: mock.location.addressBangla,
          coordinates: mock.mapCoordinates,
        },
        rent: mock.rent,
        serviceCharge: mock.serviceCharge || 0,
        securityDeposit: mock.securityDeposit || 0,
        bedrooms: mock.bedrooms || 1,
        bathrooms: mock.bathrooms || 1,
        balconies: mock.balconies || 0,
        sizeSqFt: mock.sizeSqFt,
        floor: mock.floor,
        roomType: mock.roomType || "single",
        seatsAvailable: mock.seatsAvailable || 1,
        facilities: mock.facilities || [],
        availability: mock.availability || "Available Now",
        isVerified: mock.isVerified ?? false,
        status: (mock.isVerified ? "verified" : "pending") as "pending" | "verified" | "rejected",
        isHiddenFromSearch: false,
        featuredImage: mock.featuredImage,
        images: mock.images || [mock.featuredImage],
        genderPreference: mock.genderPreference || "any",
        tenantType: mock.tenantType || "students",
        houseRules: mock.houseRules || [],
        nearbyLandmarks: mock.nearbyLandmarks || [],
        mapCoordinates: mock.mapCoordinates,
        description: mock.description,
        owner: mock.owner
          ? {
              name: mock.owner.name,
              role: mock.owner.role,
              isVerified: mock.owner.isVerified,
              memberSince: mock.owner.memberSince,
              responseTime: mock.owner.responseTime,
              phone: mock.owner.phone,
            }
          : undefined,
      };

      if (!existing) {
        await Property.create({
          ...propertyData,
          createdAt: new Date(mock.createdAt || Date.now()),
        });
        seeded++;
      } else {
        // Safe update: don't overwrite if property was updated by an owner/admin
        await Property.updateOne(
          { _id: existing._id },
          {
            $set: {
              customId: mock.id,
              // Only refresh details if existing record is pending or unchanged
              title: existing.title || mock.title,
              featuredImage: existing.featuredImage || mock.featuredImage,
            },
          }
        );
        updated++;
      }
    }

    return {
      success: true,
      seeded,
      updated,
      total: MOCK_PROPERTIES.length,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown seeding error";
    console.error("[Seed Properties Error]:", errorMsg);
    return {
      success: false,
      seeded: 0,
      updated: 0,
      total: MOCK_PROPERTIES.length,
      error: errorMsg,
    };
  }
}

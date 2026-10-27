import type {
  IProperty,
  PropertyFacility,
  PropertyFilterCriteria,
  PropertySortOption,
} from "../types/property.ts";

interface BilingualTerm {
  canonical: string;
  terms: string[];
}

const BILINGUAL_TERMS: BilingualTerm[] = [
  // District & Cities
  {
    canonical: "bogura",
    terms: ["বগুড়া", "বগুরা", "বগুড়া", "bogura", "bogra"],
  },
  {
    canonical: "dhaka",
    terms: ["ঢাকা", "dhaka", "dacca"],
  },

  // Bogura Student Hubs & Localities
  {
    canonical: "satmatha",
    terms: ["সাতমাথা", "সাত মাথা", "satmatha", "satmath", "কলেজ রোড", "college road"],
  },
  {
    canonical: "joleshwaritola",
    terms: ["জলেশ্বরীতলা", "জলেশ্বরিতলা", "জলেশ্বরী তলা", "joleshwaritola", "jaleshwaritola"],
  },
  {
    canonical: "azizul haque",
    terms: [
      "আযীযুল হক",
      "আজিজুল হক",
      "আযিযুল হক",
      "সরকারি আযীযুল হক কলেজ",
      "আজিজুল হক কলেজ",
      "azizul haque",
      "azizul hoque",
    ],
  },
  {
    canonical: "colony",
    terms: [
      "কলোনী",
      "কলোনি",
      "শেরপুর রোড",
      "শেরপুর",
      "শজিমেক",
      "মেডিকেল",
      "colony",
      "sherpur road",
      "medical",
    ],
  },

  // Dhaka Student Hubs & Localities
  {
    canonical: "banasree",
    terms: [
      "বনশ্রী",
      "বনশ্রি",
      "রামপুরা",
      "ইস্ট ওয়েস্ট",
      "banasree",
      "banashree",
      "rampura",
      "ewu",
      "east west",
    ],
  },
  {
    canonical: "mirpur",
    terms: [
      "মিরপুর",
      "মিরপুর-১০",
      "মিরপুর ১০",
      "মিরপুর-১",
      "মিরপুর-২",
      "ডিওএইচএস",
      "মিরপুর ডিওএইচএস",
      "mirpur",
      "mirpur-10",
      "mirpur 10",
      "dohs",
    ],
  },
  {
    canonical: "mohammadpur",
    terms: [
      "মোহাম্মদপুর",
      "মোহাম্মাদপুর",
      "রিং রোড",
      "mohammadpur",
      "mohammad pur",
      "ring road",
    ],
  },
  {
    canonical: "farmgate",
    terms: [
      "ফার্মগেট",
      "ফার্মগেইট",
      "ইন্দিরা রোড",
      "তেজগাঁও",
      "farmgate",
      "indira road",
      "tejgaon",
    ],
  },
  {
    canonical: "uttara",
    terms: [
      "উত্তরা",
      "সেক্টর ৭",
      "সেক্টর ১১",
      "সেক্টর",
      "uttara",
      "sector 7",
      "sector 11",
    ],
  },
  {
    canonical: "bashundhara",
    terms: [
      "বসুন্ধরা",
      "বসুন্ধরা আ/এ",
      "nsu",
      "iub",
      "bashundhara",
      "bashundhara r/a",
    ],
  },
  {
    canonical: "dhanmondi",
    terms: ["ধানমন্ডি", "ধানমণ্ডি", "ঝিগাতলা", "dhanmondi", "zigatola"],
  },
  {
    canonical: "badda",
    terms: [
      "বাড্ডা",
      "মেরুল বাড্ডা",
      "নতুন বাজার",
      "ব্র্যাক",
      "badda",
      "merul badda",
      "notun bazar",
      "brac",
    ],
  },

  // Accommodation Types
  {
    canonical: "room",
    terms: ["রুম", "সিঙ্গেল রুম", "সাবলেট", "room", "sublet", "single room"],
  },
  {
    canonical: "mess",
    terms: ["মেস", "মেস সিট", "সিট", "mess", "mess seat", "seat"],
  },
  {
    canonical: "flat",
    terms: ["ফ্ল্যাট", "বাসা", "এপার্টমেন্ট", "flat", "apartment", "house"],
  },
  {
    canonical: "hostel",
    terms: ["হোস্টেল", "হোস্টেল সিট", "hostel", "hostel seat"],
  },

  // Tenant / Gender Preferences
  {
    canonical: "male_only",
    terms: ["ছাত্র", "ছেলেদের", "পুরুষ", "ছেলে", "male", "bachelor", "boys", "ব্যাচেলর"],
  },
  {
    canonical: "female_only",
    terms: ["ছাত্রী", "মেয়েদের", "নারী", "মহিলা", "female", "girls", "women"],
  },
  {
    canonical: "family_only",
    terms: ["ফ্যামিলি", "পরিবার", "family"],
  },

  // Facilities
  {
    canonical: "wifi",
    terms: ["ওয়াইফাই", "ওয়াইফাই", "ওয়াই-ফাই", "ওয়াই-ফাই", "wifi", "internet", "নেট"],
  },
  {
    canonical: "attached_bath",
    terms: ["বাথরুম", "বাথ", "ওয়াশরুম", "অ্যাটাচড বাথ", "bath", "attached bath"],
  },
  {
    canonical: "furnished",
    terms: ["ফার্নিশড", "সুসজ্জিত", "furnished"],
  },
  {
    canonical: "balcony",
    terms: ["বারান্দা", "বেলকনি", "balcony"],
  },
  {
    canonical: "lift",
    terms: ["লিফট", "এলিভেটর", "lift", "elevator"],
  },
  {
    canonical: "generator",
    terms: ["জেনারেটর", "আইপিএস", "ips", "generator", "backup"],
  },
];

function getBilingualSynonyms(token: string): string[] {
  const synonyms = new Set<string>();
  const lowerToken = token.toLowerCase();

  for (const entry of BILINGUAL_TERMS) {
    const isMatched = entry.terms.some(
      (term) =>
        lowerToken.includes(term.toLowerCase()) ||
        term.toLowerCase().includes(lowerToken)
    );

    if (isMatched) {
      synonyms.add(entry.canonical.toLowerCase());
      for (const t of entry.terms) {
        synonyms.add(t.toLowerCase());
      }
    }
  }

  return Array.from(synonyms);
}

/**
 * Filter properties based on search query, type, budget bounds, and facility criteria.
 * Supports dual English + Bengali text query capabilities across locations, titles, and tags.
 */
export function filterProperties(
  properties: IProperty[],
  criteria: PropertyFilterCriteria
): IProperty[] {
  return properties.filter((property) => {
    // 1. Bilingual Location / Keyword Search (English & Bengali)
    if (criteria.query && criteria.query.trim() !== "") {
      const rawQuery = criteria.query.trim().toLowerCase();
      const queryTokens = rawQuery.split(/[\s,]+/).filter(Boolean);

      const propertyCorpus = [
        property.title,
        property.titleBangla || "",
        property.location.neighborhood,
        property.location.neighborhoodBangla || "",
        property.location.city,
        property.location.cityBangla || "",
        property.location.address || "",
        property.location.addressBangla || "",
        property.type,
        property.description,
        property.genderPreference || "",
        property.tenantType || "",
        ...(property.keywordsBangla || []),
        ...property.facilities,
      ]
        .join(" ")
        .toLowerCase();

      // Every search token must match either directly or through bilingual synonyms
      const matchesAllTokens = queryTokens.every((token) => {
        if (propertyCorpus.includes(token)) return true;

        const synonyms = getBilingualSynonyms(token);
        return synonyms.some((syn) => propertyCorpus.includes(syn));
      });

      if (!matchesAllTokens) {
        return false;
      }
    }

    // 2. Property Type filter
    if (criteria.propertyType && criteria.propertyType !== "all") {
      if (property.type !== criteria.propertyType) {
        return false;
      }
    }

    // 3 & 4. Budget Range (Rent in BDT) - Gracefully handles inverted min/max inputs
    const rawMin =
      criteria.minBudget !== undefined &&
      criteria.minBudget !== null &&
      !isNaN(criteria.minBudget) &&
      criteria.minBudget > 0
        ? criteria.minBudget
        : null;

    const rawMax =
      criteria.maxBudget !== undefined &&
      criteria.maxBudget !== null &&
      !isNaN(criteria.maxBudget) &&
      criteria.maxBudget > 0
        ? criteria.maxBudget
        : null;

    const effectiveMin =
      rawMin !== null && rawMax !== null && rawMin > rawMax ? rawMax : rawMin;
    const effectiveMax =
      rawMin !== null && rawMax !== null && rawMin > rawMax ? rawMin : rawMax;

    if (effectiveMin !== null && property.rent < effectiveMin) {
      return false;
    }

    if (effectiveMax !== null && property.rent > effectiveMax) {
      return false;
    }

    // 5. Facilities multi-filter (must satisfy ALL selected facilities - AND logic)
    if (criteria.facilities && criteria.facilities.length > 0) {
      const hasAllFacilities = criteria.facilities.every((requiredFacility) =>
        property.facilities.includes(requiredFacility)
      );
      if (!hasAllFacilities) {
        return false;
      }
    }

    // 6. Gender Preference filter (if specified and not "any")
    if (
      criteria.genderPreference &&
      criteria.genderPreference !== "any" &&
      property.genderPreference
    ) {
      if (
        property.genderPreference !== "any" &&
        property.genderPreference !== criteria.genderPreference
      ) {
        return false;
      }
    }

    // 7. Verified only filter
    if (criteria.onlyVerified && !property.isVerified) {
      return false;
    }

    return true;
  });
}

/**
 * Sort properties based on selected sort option.
 */
export function sortProperties(
  properties: IProperty[],
  sortOption: PropertySortOption
): IProperty[] {
  const cloned = [...properties];

  switch (sortOption) {
    case "price_asc":
      return cloned.sort((a, b) => a.rent - b.rent);

    case "price_desc":
      return cloned.sort((a, b) => b.rent - a.rent);

    case "newest":
      return cloned.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case "recommended":
    default:
      // Verified listings prioritized, then ordered by recency
      return cloned.sort((a, b) => {
        if (a.isVerified !== b.isVerified) {
          return a.isVerified ? -1 : 1;
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }
}

/**
 * Predefined facility labels and metadata for consistent UI representation.
 */
export const FACILITY_DEFINITIONS: {
  id: PropertyFacility;
  label: string;
}[] = [
  { id: "wifi", label: "Wi-Fi" },
  { id: "attached_bath", label: "Attached Bathroom" },
  { id: "furnished", label: "Furnished" },
  { id: "balcony", label: "Balcony" },
  { id: "family_friendly", label: "Family Friendly" },
  { id: "generator", label: "Generator Backup" },
  { id: "lift", label: "Elevator / Lift" },
  { id: "cctv", label: "CCTV Security" },
  { id: "kitchen", label: "Kitchen Access" },
];

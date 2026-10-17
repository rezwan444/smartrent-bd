import {
  CategoryBreakdown,
  CategoryMatchStatus,
  CompatibilityResult,
  RoommateProfile,
  UserPreferencesProfile,
} from "@/types/roommate";

export const DEFAULT_USER_PROFILE: UserPreferencesProfile = {
  name: "Rayhan Ahmed",
  university: "University of Dhaka (DU)",
  department: "Computer Science & Engineering",
  maxBudget: 6500,
  gender: "male",
  lifestyle: {
    sleepSchedule: "night_owl",
    studyEnvironment: "silent",
    smokingHabit: "non_smoker",
    foodPreference: "mess_system",
    cleanliness: "strict",
    guestPolicy: "advance_notice",
  },
};

export const LIFESTYLE_LABELS: Record<string, Record<string, string>> = {
  sleepSchedule: {
    early_bird: "Early Bird (sleeps before 11 PM)",
    moderate: "Moderate (11 PM - 1 AM)",
    night_owl: "Night Owl (stays up after 1 AM)",
  },
  studyEnvironment: {
    silent: "Quiet / Library Silence",
    ambient_music: "Ambient / Soft Music",
    group_friendly: "Group Discussion Friendly",
    flexible: "Flexible / Adaptable",
  },
  smokingHabit: {
    non_smoker: "Strict Non-Smoker",
    outside_only: "Outside / Balcony Only",
    smoker: "Smoker",
  },
  foodPreference: {
    mess_system: "Shared Mess Meal System",
    cook_myself: "Cook Independently",
    veg_only: "Vegetarian / Halal Strict",
    flexible: "Flexible / Any arrangement",
  },
  cleanliness: {
    strict: "Strict / Daily Cleaning",
    moderate: "Moderate / Weekly Tidy",
    relaxed: "Relaxed / Flexible",
  },
  guestPolicy: {
    no_guests: "No Guests in Flat",
    daytime_only: "Daytime Guests Only",
    advance_notice: "Guests Allowed with Notice",
    flexible: "Guests Welcome / Flexible",
  },
};

export function getStatus(score: number): CategoryMatchStatus {
  if (score >= 85) return "excellent";
  if (score >= 65) return "good";
  if (score >= 40) return "moderate";
  return "conflict";
}

/**
 * Deterministic Compatibility Algorithm
 * Total weight = 100 points
 * 1. Sleep Schedule (25%): Sleep synchronicity is the #1 student friction source
 * 2. Smoking Habit (20%): Dealbreaker for non-smokers vs active smokers
 * 3. Budget Alignment (20%): Financial feasibility for seat/room sharing
 * 4. Study Environment (15%): Academic alignment (silent vs group discussions)
 * 5. Cleanliness Standard (10%): Household duty and room hygiene alignment
 * 6. Food / Mess Policy (10%): Meal cost sharing & cooking schedule
 */
export function calculateCompatibility(
  user: UserPreferencesProfile,
  profile: RoommateProfile
): CompatibilityResult {
  const breakdown: CategoryBreakdown[] = [];
  const keyStrengths: string[] = [];
  const potentialFrictions: string[] = [];

  const uLife = user.lifestyle || DEFAULT_USER_PROFILE.lifestyle;
  const pLife = profile.lifestyle || DEFAULT_USER_PROFILE.lifestyle;

  // 1. Sleep Schedule (Weight: 25)
  let sleepScore = 50;
  let sleepReason = "Moderate alignment in sleeping patterns.";
  if (uLife.sleepSchedule === pLife.sleepSchedule) {
    sleepScore = 100;
    sleepReason = `Synchronized sleep routines: Both are ${LIFESTYLE_LABELS.sleepSchedule[uLife.sleepSchedule]}.`;
    keyStrengths.push(`Identical sleep schedules (${LIFESTYLE_LABELS.sleepSchedule[uLife.sleepSchedule]})`);
  } else if (
    (uLife.sleepSchedule === "moderate" && pLife.sleepSchedule !== "moderate") ||
    (pLife.sleepSchedule === "moderate" && uLife.sleepSchedule !== "moderate")
  ) {
    sleepScore = 65;
    sleepReason = "Slightly shifted waking hours, but manageable with basic courtesy.";
  } else {
    // Early Bird vs Night Owl
    sleepScore = 15;
    sleepReason = "Schedule friction: Early Bird paired with Night Owl may cause bedtime light & noise disruptions.";
    potentialFrictions.push("Sleep schedule gap (Early Bird vs Night Owl)");
  }

  breakdown.push({
    category: "Sleep Routine",
    key: "sleepSchedule",
    weight: 25,
    score: sleepScore,
    status: getStatus(sleepScore),
    reason: sleepReason,
    userValue: LIFESTYLE_LABELS.sleepSchedule[uLife.sleepSchedule] || uLife.sleepSchedule,
    profileValue: LIFESTYLE_LABELS.sleepSchedule[pLife.sleepSchedule] || pLife.sleepSchedule,
  });

  // 2. Smoking Habit (Weight: 20)
  let smokeScore = 50;
  let smokeReason = "Smoking preferences align reasonably.";
  if (uLife.smokingHabit === pLife.smokingHabit) {
    smokeScore = 100;
    if (uLife.smokingHabit === "non_smoker") {
      smokeReason = "100% Smoke-free environment: Both strongly prefer a smoke-free living space.";
      keyStrengths.push("Both strictly non-smokers");
    } else {
      smokeReason = "Smoking preferences are completely mutual.";
    }
  } else if (
    (uLife.smokingHabit === "non_smoker" && pLife.smokingHabit === "outside_only") ||
    (uLife.smokingHabit === "outside_only" && pLife.smokingHabit === "non_smoker")
  ) {
    smokeScore = 60;
    smokeReason = "Acceptable compromise: Smoking is restricted to balcony or outside only.";
  } else {
    smokeScore = 0;
    smokeReason = "Major dealbreaker: Non-smoker paired with an active indoor smoker.";
    potentialFrictions.push("Smoking habit dealbreaker");
  }

  breakdown.push({
    category: "Smoking Policy",
    key: "smokingHabit",
    weight: 20,
    score: smokeScore,
    status: getStatus(smokeScore),
    reason: smokeReason,
    userValue: LIFESTYLE_LABELS.smokingHabit[uLife.smokingHabit] || uLife.smokingHabit,
    profileValue: LIFESTYLE_LABELS.smokingHabit[pLife.smokingHabit] || pLife.smokingHabit,
  });

  // 3. Budget Alignment (Weight: 20)
  const userBudget = user.maxBudget || 6500;
  const profileBudget = profile.maxBudget || 6500;
  const budgetDiff = Math.abs(userBudget - profileBudget);

  let budgetScore = 20;
  let budgetReason = `Budget difference of ৳${budgetDiff.toLocaleString()} BDT.`;
  if (budgetDiff <= 500) {
    budgetScore = 100;
    budgetReason = "Near-identical budget tier (within ৳500 of each other).";
    keyStrengths.push(`Compatible monthly seat budget (~৳${profileBudget.toLocaleString()} BDT)`);
  } else if (budgetDiff <= 1500) {
    budgetScore = 80;
    budgetReason = `Close budget alignment (৳${userBudget.toLocaleString()} vs ৳${profileBudget.toLocaleString()}).`;
  } else if (budgetDiff <= 3000) {
    budgetScore = 50;
    budgetReason = `Moderate budget gap (৳${budgetDiff.toLocaleString()} difference). Requires compromise on flat type.`;
    potentialFrictions.push(`৳${budgetDiff.toLocaleString()} budget discrepancy`);
  } else {
    budgetScore = 20;
    budgetReason = `Significant budget gap of ৳${budgetDiff.toLocaleString()} BDT. Likely looking at different accommodation categories.`;
    potentialFrictions.push(`High budget discrepancy (>৳3,000 difference)`);
  }

  breakdown.push({
    category: "Monthly Budget",
    key: "budget",
    weight: 20,
    score: budgetScore,
    status: getStatus(budgetScore),
    reason: budgetReason,
    userValue: `Up to ৳${userBudget.toLocaleString()} BDT`,
    profileValue: `Up to ৳${profileBudget.toLocaleString()} BDT`,
  });

  // 4. Study Environment (Weight: 15)
  let studyScore = 60;
  let studyReason = "Compatible study habits.";
  if (uLife.studyEnvironment === pLife.studyEnvironment) {
    studyScore = 100;
    studyReason = `Matching study style: Both prefer ${LIFESTYLE_LABELS.studyEnvironment[uLife.studyEnvironment]}.`;
    keyStrengths.push(`Harmonious study focus (${LIFESTYLE_LABELS.studyEnvironment[uLife.studyEnvironment]})`);
  } else if (uLife.studyEnvironment === "flexible" || pLife.studyEnvironment === "flexible") {
    studyScore = 90;
    studyReason = "High adaptability: At least one person is flexible with study conditions.";
  } else if (
    (uLife.studyEnvironment === "silent" && pLife.studyEnvironment === "ambient_music") ||
    (uLife.studyEnvironment === "ambient_music" && pLife.studyEnvironment === "silent")
  ) {
    studyScore = 70;
    studyReason = "Manageable study routine: Use of headphones easily resolves ambient music preference.";
  } else {
    studyScore = 30;
    studyReason = "Study routine friction: Strict silent study versus active group discussions.";
    potentialFrictions.push("Study environment preference mismatch (Silent vs Group discussion)");
  }

  breakdown.push({
    category: "Study Focus",
    key: "studyEnvironment",
    weight: 15,
    score: studyScore,
    status: getStatus(studyScore),
    reason: studyReason,
    userValue: LIFESTYLE_LABELS.studyEnvironment[uLife.studyEnvironment] || uLife.studyEnvironment,
    profileValue: LIFESTYLE_LABELS.studyEnvironment[pLife.studyEnvironment] || pLife.studyEnvironment,
  });

  // 5. Cleanliness & Hygiene (Weight: 10)
  let cleanScore = 50;
  let cleanReason = "Balanced cleanliness expectations.";
  if (uLife.cleanliness === pLife.cleanliness) {
    cleanScore = 100;
    cleanReason = `Identical cleanliness standards (${LIFESTYLE_LABELS.cleanliness[uLife.cleanliness]}).`;
    keyStrengths.push(`Shared hygiene standards (${LIFESTYLE_LABELS.cleanliness[uLife.cleanliness]})`);
  } else if (
    (uLife.cleanliness === "strict" && pLife.cleanliness === "moderate") ||
    (uLife.cleanliness === "moderate" && pLife.cleanliness === "strict")
  ) {
    cleanScore = 75;
    cleanReason = "Compatible hygiene standards with minor adjustment to weekly cleaning rotations.";
  } else {
    cleanScore = 30;
    cleanReason = "Hygiene expectations differ: Strict daily tidiness vs relaxed housekeeping style.";
    potentialFrictions.push("Cleanliness and housekeeping expectations vary");
  }

  breakdown.push({
    category: "Cleanliness",
    key: "cleanliness",
    weight: 10,
    score: cleanScore,
    status: getStatus(cleanScore),
    reason: cleanReason,
    userValue: LIFESTYLE_LABELS.cleanliness[uLife.cleanliness] || uLife.cleanliness,
    profileValue: LIFESTYLE_LABELS.cleanliness[pLife.cleanliness] || pLife.cleanliness,
  });

  // 6. Food / Meal System (Weight: 10)
  let foodScore = 50;
  let foodReason = "Workable dining arrangement.";
  if (uLife.foodPreference === pLife.foodPreference) {
    foodScore = 100;
    foodReason = `Coinciding meal arrangement: Both prefer ${LIFESTYLE_LABELS.foodPreference[uLife.foodPreference]}.`;
    keyStrengths.push(`Unified meal arrangement (${LIFESTYLE_LABELS.foodPreference[uLife.foodPreference]})`);
  } else if (uLife.foodPreference === "flexible" || pLife.foodPreference === "flexible") {
    foodScore = 90;
    foodReason = "Flexible meal routine: Ready to join mess meal system or manage personal food.";
  } else {
    foodScore = 50;
    foodReason = "Different cooking preferences; can easily run independent grocery/cooking accounts.";
  }

  breakdown.push({
    category: "Food / Mess Routine",
    key: "foodPreference",
    weight: 10,
    score: foodScore,
    status: getStatus(foodScore),
    reason: foodReason,
    userValue: LIFESTYLE_LABELS.foodPreference[uLife.foodPreference] || uLife.foodPreference,
    profileValue: LIFESTYLE_LABELS.foodPreference[pLife.foodPreference] || pLife.foodPreference,
  });

  // Compute weighted sum
  const totalWeight = breakdown.reduce((acc, item) => acc + item.weight, 0);
  const weightedSum = breakdown.reduce(
    (acc, item) => acc + (item.score * item.weight) / 100,
    0
  );
  const overallScore = Math.round((weightedSum / totalWeight) * 100);

  // Bonus/penalty checks (e.g. same university campus bonus)
  if (user.university && profile.university && user.university === profile.university) {
    keyStrengths.unshift(`Same Campus: Both attend ${user.university}`);
  }

  return {
    overallScore,
    categoryBreakdown: breakdown,
    keyStrengths,
    potentialFrictions,
    disclaimer:
      "Compatibility scores are calculated algorithmically based on self-reported lifestyle preferences to help you discover suitable roommates. Scores do not guarantee personal harmony or replace in-person conversations.",
  };
}

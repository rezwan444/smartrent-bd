export type Gender = "male" | "female";
export type RoomType = "single_room" | "shared_seat" | "flat_sublet";

export type SleepSchedule = "early_bird" | "moderate" | "night_owl";
export type StudyEnvironment = "silent" | "ambient_music" | "group_friendly" | "flexible";
export type SmokingHabit = "non_smoker" | "outside_only" | "smoker";
export type FoodPreference = "mess_system" | "cook_myself" | "veg_only" | "flexible";
export type CleanlinessStandard = "strict" | "moderate" | "relaxed";
export type GuestPolicy = "no_guests" | "daytime_only" | "advance_notice" | "flexible";

export interface RoommateLifestyle {
  sleepSchedule: SleepSchedule;
  studyEnvironment: StudyEnvironment;
  smokingHabit: SmokingHabit;
  foodPreference: FoodPreference;
  cleanliness: CleanlinessStandard;
  guestPolicy: GuestPolicy;
}

export interface RoommateContact {
  phone: string;
  maskedPhone: string;
  email: string;
  maskedEmail: string;
  whatsapp: string;
}

export interface RoommateProfile {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  avatar: string;
  university: string;
  department: string;
  semester: string;
  preferredLocations: string[];
  maxBudget: number;
  moveInDate: string;
  lookingForGender: Gender | "any";
  lookingForRoomType: RoomType;
  lifestyle: RoommateLifestyle;
  about: string;
  hobbies: string[];
  contact: RoommateContact;
  verifiedStudent: boolean;
  studentIdCardNumberMasked: string;
}

export interface UserPreferencesProfile {
  name: string;
  university: string;
  department: string;
  maxBudget: number;
  gender: Gender;
  lifestyle: RoommateLifestyle;
}

export type CategoryMatchStatus = "excellent" | "good" | "moderate" | "conflict";

export interface CategoryBreakdown {
  category: string;
  key: keyof RoommateLifestyle | "budget";
  weight: number;
  score: number; // 0 to 100%
  status: CategoryMatchStatus;
  reason: string;
  userValue: string;
  profileValue: string;
}

export interface CompatibilityResult {
  overallScore: number; // 0 to 100
  categoryBreakdown: CategoryBreakdown[];
  keyStrengths: string[];
  potentialFrictions: string[];
  disclaimer: string;
}

export type ConnectionStatus = "NONE" | "REQUEST_SENT" | "MUTUAL_ACCEPTED" | "DECLINED";

export interface RoommateConnectionRecord {
  targetProfileId: string;
  status: ConnectionStatus;
  requestedAt: string;
  respondedAt?: string;
  notes?: string;
}

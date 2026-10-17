export interface IMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  seasonNumber?: number;
  year?: number;
}

export interface IBaseResponse<T = void, M = IMeta> {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: M;
  data?: T;
}

export enum IAllStatusEnum {
  ALL = "ALL",
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
  AVAILABLE = "AVAILABLE",
  UNAVAILABLE = "UNAVAILABLE",
  CANCELLED = "CANCELLED",
  INACTIVE = "INACTIVE",
  DISPUTED = "DISPUTED",
  DISABLED = "DISABLED",
  DISABILITES_CARE = "DISABILITES_CARE",
  SCHEDULED = "SCHEDULED",
  ERROR = "ERROR",
  ONGOING = "ONGOING",
  SUSPENDED = "SUSPENDED",
  FAILED = "FAILED",
  SUCCESS = "SUCCESS",
  UNKNOWN = "UNKNOWN",
  IN_PROGRESS = "IN_PROGRESS",
  CLAIMED = "CLAIMED",
}

export const enum IDayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export const enum IRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
  OWNER = "OWNER",
}

export const enum IGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export const enum ITier {
  STANDARD = "STANDARD",
  PREMIUM = "PREMIUM",
  ELITE = "ELITE",
}

export const enum IRegion {
  NORTH = "NORTH",
  SOUTH = "SOUTH",
  EAST = "EAST",
  WEST = "WEST",
  MOUNTAIN = "MOUNTAIN",
  PACIFIC = "PACIFIC",
  MIDWEST = "MIDWEST",
  NORTHWEST = "NORTHWEST",
}
export type TRegion =
  | "NORTH"
  | "SOUTH"
  | "EAST"
  | "WEST"
  | "MOUNTAIN"
  | "PACIFIC"
  | "MIDWEST"
  | "NORTHWEST";

export type TTier = "STANDARD" | "PREMIUM" | "ELITE";

export interface ChildrenProps {
  children: React.ReactNode;
}

// AUTHENTICATION FLOW TYPES

// Login Types

// Login & Get Profile Types

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IAdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  location: string | null;
  profilePictureUrl: string | null;
  role: IRole;
  status: IAllStatusEnum.ACTIVE | IAllStatusEnum.INACTIVE;
  twoFactor: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ILoginData = IAdminProfile & {
  accessToken: string;
};

export type ILoginResponse = IBaseResponse<ILoginData>;

// ===================
// Password Change Types

// Forgot types
export interface IForgotPasswordPayload {
  email: string;
}
export type IForgotPasswordResponse = IBaseResponse<{
  message: string;
  verificationToken?: string;
}>;

// Resend OTP
export interface IResendOTPReqBody {
  email: string;
}

export type IResendOTPBaseResponse = IBaseResponse<{
  message: string;
  verificationToken?: string;
}>;

export interface IResetPasswordPayload {
  newPassword: string;
  confirmPassword: string;
  token: string;
}

export type IResetPasswordResponse = IBaseResponse;

// Verify OTP type
export interface IVerifyOTPPayload {
  type: "PASSWORD_RESET";
  otp: string;
  verificationToken: string;
  //   email: string;
  //   otp: string;
}

export type IVerifyOTPResponse = IBaseResponse<{ resetToken: string }>;

// DASHBOARD ROUTES TYPES START

// TEAM TYPES

export interface ITeam {
  id: string;
  mascot: string;
  slug: string;
  city: string;
  tiaraName: ITier;
  region: IRegion;
  status:
    | IAllStatusEnum.ACTIVE
    | IAllStatusEnum.INACTIVE
    | IAllStatusEnum.BLOCKED
    | IAllStatusEnum.SUSPENDED;
  ownershipStatus:
    | IAllStatusEnum.AVAILABLE
    | IAllStatusEnum.UNAVAILABLE
    | IAllStatusEnum.CLAIMED;
  reservedUntil: string | null;
  logo_url: string | null;
  description: string;
  createdById: string;
  updatedById: string;
  ownerUserId: string | null;
  logoUrl: string | null;
  uniformJson: string | null;
  createdAt: string;
  updatedAt: string;
  divisionId: string | null;
  division: {
    id: string;
    name: string;
    regionId: string;
  } | null;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    profilePictureUrl: string | null;
    role: string;
    phone: string | null;
    twoFactorEnabled: boolean;
    verified: boolean;
    status: IAllStatusEnum;
    createdAt: string;
    updatedAt: string;
    twoFactor: boolean;
    loggedInUsing: string;
    fcmToken: string | null;
  } | null;
}

export type TTeamPayload = {
  limit?: number;
  page?: number;
  search?: string;
  tiaraName?: ITier | "";
  region?: IRegion | "";
};

export type TTeamResponse = IBaseResponse<ITeam[]>;

// delete team

export type TDeleteTeamPayload = { teamId: string };
export type TDeleteTeamResponse = IBaseResponse;

export type TCreateTeamPayload = {
  logo: string;
  mascot: string;
  city: string;
  region: IRegion;
  status: string;
  ownershipStatus: string;
  description: string;
  divisionId: string;
  tier: ITier;
  uniformJson: string;
};

export type TCreateTeamResponse = IBaseResponse;

// TEAM TYPES END

// TIER TYPES START
export interface ITierStructure {
  id: string;
  tier: ITier;
  name: string;
  description: string;
  price: number;
  currency: string;
  benefits: Record<string, string>;
  stripeProductId: string;
  stripePriceId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TTierPayload = void;
export type TTierResponse = IBaseResponse<ITierStructure[]>;

// TIER TYPES END

// REGION TYPES START

export interface IRegionStructure {
  id: string;
  name: IRegion;
  createdAt: string;
  divisions: {
    id: string;
    name: string;
    regionId: string;
  }[];
}

export type TRegionPayload = void;
export type TRegionResponse = IBaseResponse<IRegionStructure[]>;
// REGION TYPES END

// TOURNAMENT STATUS TYPES START
export interface ITournamentStatus {
  isTournamentActive: boolean;
  liveMatchCount: number;
  status: string;
}
export type TTournamentStatusResponse = IBaseResponse<ITournamentStatus>;
// TOURNAMENT STATUS TYPES END

// LIVE MATCH TYPES START
export interface ILiveMatch {
  id: string;
  weekNumber: number;
  teamHomeId: string;
  teamAwayId: string;
  gameTime: string;
  streamKey: string | null;
  rtmpUrl: string | null;
  playbackUrl: string | null;
  channelArn: string | null;
  viewerCount: number;
  roundNumber: number;
  winnerId: string | null;
  parentMatchId: string | null;
  status: string; // i will update this to enum later
  createdAt: string;
  updatedAt: string;
  teamHome: ITeam;
  teamAway: ITeam;
  score: { home?: number; away?: number } | null;
}

export type TLiveMatchesResponse = IBaseResponse<ILiveMatch[]>;
export type TMatchDetailsResponse = IBaseResponse<ILiveMatch>;
export type TMatchDetailsPayload = string;
// LIVE MATCH TYPES END

export enum AdStatus {
  ACTIVE = "ACTIVE",
  STOPPED = "STOPPED",
}

export enum AdType {
  VIDEO = "VIDEO",
  BANNER = "BANNER",
  OVERLAY = "OVERLAY",
}

export interface IAdvertisement {
  id: string;
  sponsorName: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: AdStatus;
  adType: AdType;
  revenueShare: number;
  totalRevenue: string;
  adUrl: string;
  mediaUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TAdPayload = {
  page?: number;
  limit?: number;
};
export type TAdResponse = IBaseResponse<IAdvertisement[]>;
// ADVERTISEMENT TYPES END

// FINANCIAL CENTER TYPES START
export interface IFinancialMetrics {
  totalRevenueYTD: number;
  eliteTierSales: number;
  premiumTierSales: number;
  standardTierSales: number;
  sponsorRevenueYTD: number;
  viewerSubscriptions: number;
}

export interface IFinancialRecentActivityUser {
  id: string;
  name: string;
  email: string;
  profilePictureUrl: string | null;
}

export interface IFinancialRecentActivity {
  id: string;
  date: string;
  user: IFinancialRecentActivityUser;
  tier: string;
  teamName: string;
  amount: number;
  status: string;
}

export interface IFinancialCenterData {
  metrics: IFinancialMetrics;
  recentActivity: IFinancialRecentActivity[];
}

export type TFinancialCenterResponse = IBaseResponse<IFinancialCenterData>;
// FINANCIAL CENTER TYPES END

// AI VIOLATION TYPES START
export enum AiViolationStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

export interface IAiViolationReporter {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface IAiViolationTeam {
  id: string;
  mascot: string;
  city: string;
  tiaraName: string;
  region: string;
  logoUrl: string | null;
}

export interface IAiViolation {
  id: string;
  teamId: string;
  reporterId: string;
  screenshotUrl: string;
  note: string;
  status: AiViolationStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: IAiViolationReporter;
  team: IAiViolationTeam;
}

export type TAiViolationPayload = {
  page?: number;
  limit?: number;
  status?: AiViolationStatus;
};

export type TAiViolationResponse = IBaseResponse<IAiViolation[]>;
export type TSingleAiViolationResponse = IBaseResponse<IAiViolation>;
export type TRecentCheatingViolationsResponse = IBaseResponse<IAiViolation>;
// CHEATING ALERT TYPES END

export enum AccountStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  ON_WATCHLIST = "ON_WATCHLIST",
  BANNED = "BANNED",
}

// ADMIN DASHBOARD TYPES START
export interface IAdminDashboardOverview {
  totalRegistered: number;
  activePlayers: number;
  assignedTeams: number;
  totalFranchises: number;
  activeInvestigations: number;
  revenueLast7Days: number;
}

export interface IAdminDashboardNextMajorEvent {
  title: string;
  date: string;
  daysRemaining: number;
}

export interface IAdminDashboardMostViewedTeam {
  id: string;
  mascot: string;
  city: string;
  tier: string;
  logoUrl: string;
  views: number;
}

export interface IAdminDashboardRecentCheatingAlert {
  id: string;
  playerName: string;
  teamMascot: string;
  cheatingType: string;
  riskScore: number;
  status: string;
}

export interface IAdminDashboardTodaysMatchTeam {
  id: string;
  mascot: string;
  city: string;
  logoUrl: string;
}

export interface IAdminDashboardTodaysMatch {
  id: string;
  teamHome: IAdminDashboardTodaysMatchTeam;
  teamAway: IAdminDashboardTodaysMatchTeam;
  status: string;
  gameTime: string;
  result: string;
}

export interface IAdminDashboardWaitlist {
  playersInQueue: number;
}

export interface IAdminDashboardData {
  overview: IAdminDashboardOverview;
  nextMajorEvent: IAdminDashboardNextMajorEvent;
  mostViewedTeams: IAdminDashboardMostViewedTeam[];
  recentCheatingAlerts: IAdminDashboardRecentCheatingAlert[];
  todaysMatches: IAdminDashboardTodaysMatch[];
  waitlist: IAdminDashboardWaitlist;
}

export type TAdminDashboardResponse = IBaseResponse<IAdminDashboardData>;
// ADMIN DASHBOARD TYPES END

// SITE INFO TYPES START
export interface ISiteInfo {
  location: string;
  email: string;
  phone: string;
  xProfileLink: string;
  instagramProfileLink: string;
  facebookProfileLink: string;
}

export type TSiteInfoResponse = IBaseResponse<ISiteInfo>;
// SITE INFO TYPES END

// SUSPENDED USER TYPES START
export interface ISuspendedUser {
  id: string;
  name: string;
  email: string;
  suspendedAt: string;
  suspensionReason: string;
}

export type TSuspendedUserResponse = IBaseResponse<ISuspendedUser[]>;
// SUSPENDED USER TYPES END

// WAITLIST TYPES START
export interface IWaitlistMeta extends IMeta {
  stats: {
    pendingReview: number;
    approved: number;
    assignedTeams: number;
    rejected: number;
  };
}
export enum IWaitlistStatusEnum {
  PENDING = "PENDING",
  NOTIFIED = "NOTIFIED",
  APPROVED = "APPROVED",
  CANCELLED = "CANCELLED",
}

export interface IWaitlistUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
}

export interface IWaitlist {
  id: string;
  userId: string;
  preferredRegion: TRegion;
  preferredTier: TTier;
  status: IWaitlistStatusEnum;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  user: IWaitlistUser;
}
// WAITLIST TYPES END

// SEASON STANDINGS TYPES START
export interface IStandingsTeam {
  rank: number;
  id: string;
  mascot: string;
  city: string;
  logoUrl: string | null;
  tiaraName: string;
  region: string;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  totalPoints: number;
  winningAmount: string | null;
}

export interface IPlayoffTeam {
  id: string;
  mascot: string;
  city: string;
  tiaraName: string;
  region: string;
  logoUrl: string | null;
  logo_url: string | null;
  winningAmount: string | null;
}

export interface IPlayoffScore {
  matchId: string;
  teamHomeScore: number;
  teamAwayScore: number;
  statsJson: Record<string, string>;
  submittedByUserId: string;
  submittedAt: string;
  aiValidationScore: string;
  flagged: boolean;
  createdAt: string;
}

export interface IPlayoffMatch {
  id: string;
  roundNumber: number;
  weekNumber: number;
  gameTime: string;
  status: string;
  winnerId: string | null;
  teamHome: IPlayoffTeam;
  teamAway: IPlayoffTeam;
  score: IPlayoffScore | null;
}

export type TRegionStandingsResponse = IBaseResponse<IStandingsTeam[]>;
export type TPlayoffBracketsResponse = IBaseResponse<IPlayoffMatch[]>;

// SEASON MANAGEMENT TYPES START
export type TSeasonStatus = "UPCOMING" | "ACTIVE" | "INACTIVE" | "COMPLETED" | "CANCELLED" | string;

export interface ISeason {
  id: string;
  seasonNumber: number;
  status: TSeasonStatus;
  scheduledActivationAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    franchises?: number;
  };
}

export interface IMaddenTeamSelection {
  id: string;
  teamId: string;
  seasonNumber: number;
  maddenTeam: string;
  maddenTeamLocked: boolean;
  lockedAt: string | null;
  updatedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateSeasonPayload {
  seasonNumber: number;
}

export interface ISelectMaddenTeamPayload {
  teamId: string;
  maddenTeam: string;
  lockAcknowledged: boolean;
}

export interface IActivateSeasonPayload {
  seasonNumber: number;
  scheduledAt?: string;
}

export interface IDeactivateSeasonPayload {
  seasonNumber: number;
}

export interface IOverrideLockPayload {
  seasonNumber: number;
  locked: boolean;
}

export interface IScheduleSeasonMatchesPayload {
  seasonNumber: number;
}

export type TMaddenTeamsResponse = IBaseResponse<string[]>;
export type TGetAllSeasonsResponse = IBaseResponse<ISeason[]>;
export type TCreateSeasonResponse = IBaseResponse<ISeason>;
export type TSelectMaddenTeamResponse = IBaseResponse<IMaddenTeamSelection>;
export type TActivateSeasonResponse = IBaseResponse<ISeason>;
export type TDeactivateSeasonResponse = IBaseResponse<ISeason>;
export type TOverrideLockResponse = IBaseResponse<{
  seasonNumber: number;
  locked: boolean;
}>;
// SEASON MANAGEMENT TYPES END



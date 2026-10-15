import {
  IBaseResponse,
  IScheduleSeasonMatchesPayload,
  TLiveMatchesResponse,
  TMatchDetailsResponse,
  TTournamentStatusResponse,
} from "@/types/global";
import baseApi from "../baseApi";

const matchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    scheduleTournament: builder.mutation<IBaseResponse<void>, { startTime: string }>({
      query: (body) => ({
        url: "/match/schedule-tournament",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Team", "Match"],
    }),
    scheduleSeasonMatches: builder.mutation<IBaseResponse<void>, IScheduleSeasonMatchesPayload>({
      query: (body) => ({
        url: "/match/schedule-season",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Team", "Match", "Season"],
    }),
    resetTournament: builder.mutation<IBaseResponse<void>, void>({
      query: () => ({
        url: "/match/reset-tournament",
        method: "POST",
      }),
      invalidatesTags: ["Team", "Match"],
    }),
    getTournamentStatus: builder.query<TTournamentStatusResponse, void>({
      query: () => ({
        url: "/match/status",
        method: "GET",
      }),
      providesTags: ["Team"],
    }),
    getLiveMatches: builder.query<TLiveMatchesResponse, void>({
      query: () => ({
        url: "/match/live",
        method: "GET",
      }),
      providesTags: ["Match"],
    }),
    getScheduledMatches: builder.query<TLiveMatchesResponse, void>({
      query: () => ({
        url: "/match/scheduled",
        method: "GET",
      }),
      providesTags: ["Match"],
    }),
    getMatchDetails: builder.query<TMatchDetailsResponse, string>({
      query: (matchId) => ({
        url: `/match/${matchId}`,
        method: "GET",
      }),
      providesTags: ["Match"],
    }),
  }),
});

export const {
  useScheduleTournamentMutation,
  useScheduleSeasonMatchesMutation,
  useResetTournamentMutation,
  useGetTournamentStatusQuery,
  useGetLiveMatchesQuery,
  useGetScheduledMatchesQuery,
  useGetMatchDetailsQuery,
} = matchApi;


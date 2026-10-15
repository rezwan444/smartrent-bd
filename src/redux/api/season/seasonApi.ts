import {
  ICreateSeasonPayload,
  ISelectMaddenTeamPayload,
  IActivateSeasonPayload,
  IDeactivateSeasonPayload,
  IOverrideLockPayload,
  TMaddenTeamsResponse,
  TGetAllSeasonsResponse,
  TCreateSeasonResponse,
  TSelectMaddenTeamResponse,
  TActivateSeasonResponse,
  TDeactivateSeasonResponse,
  TOverrideLockResponse,
} from "@/types/global";
import baseApi from "../baseApi";

export const seasonApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get All Seasons List
    getSeasons: builder.query<TGetAllSeasonsResponse, void>({
      query: () => ({
        url: "/seasons",
        method: "GET",
      }),
      providesTags: ["Season"],
    }),

    // 2. Get 32 Madden Teams List (Public)
    getMaddenTeams: builder.query<TMaddenTeamsResponse, void>({
      query: () => ({
        url: "/seasons/madden-teams",
        method: "GET",
      }),
      providesTags: ["Season"],
    }),

    // 3. Create new Season (Admin Only)
    createSeason: builder.mutation<TCreateSeasonResponse, ICreateSeasonPayload>({
      query: (body) => ({
        url: "/seasons",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Season"],
    }),

    // 4. Select / Change Madden in-game team
    selectMaddenTeam: builder.mutation<
      TSelectMaddenTeamResponse,
      ISelectMaddenTeamPayload
    >({
      query: (body) => ({
        url: "/seasons/select-madden-team",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Season", "Team"],
    }),

    // 5. Activate season and lock all team selections
    activateSeason: builder.mutation<
      TActivateSeasonResponse,
      IActivateSeasonPayload
    >({
      query: (body) => ({
        url: "/seasons/activate",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Season", "Team"],
    }),

    // 6. Deactivate active season
    deactivateSeason: builder.mutation<
      TDeactivateSeasonResponse,
      IDeactivateSeasonPayload
    >({
      query: (body) => ({
        url: "/seasons/deactivate",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Season", "Team"],
    }),

    // 7. Override season lock / Manual unlock
    overrideLock: builder.mutation<
      TOverrideLockResponse,
      IOverrideLockPayload
    >({
      query: (body) => ({
        url: "/seasons/override-lock",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Season", "Team"],
    }),
  }),
});

export const {
  useGetSeasonsQuery,
  useGetMaddenTeamsQuery,
  useCreateSeasonMutation,
  useSelectMaddenTeamMutation,
  useActivateSeasonMutation,
  useDeactivateSeasonMutation,
  useOverrideLockMutation,
} = seasonApi;


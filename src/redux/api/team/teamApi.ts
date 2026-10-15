/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TCreateTeamResponse,
  TDeleteTeamPayload,
  TDeleteTeamResponse,
  TTeamPayload,
  TTeamResponse,
} from "@/types/global";
import baseApi from "../baseApi";

const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTeams: builder.query<TTeamResponse, TTeamPayload>({
      query: ({ limit, page, search, tiaraName, region }) => ({
        url: "/teams",
        method: "GET",
        params: {
          limit,
          page,
          search: search ?? "",
          tiaraName: tiaraName ?? "",
          region: region ?? "",
        },
      }),
      providesTags: ["Team"],
    }),
    // suspend / delete team
    deleteTeam: builder.mutation<TDeleteTeamResponse, TDeleteTeamPayload>({
      query: ({ teamId: id }) => ({
        url: `/teams/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Team"],
    }),
    // create team
    createTeam: builder.mutation<TCreateTeamResponse, any>({
      query: (body) => ({
        url: "/teams",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Team"],
    }),
    // edit/ update team - same as create team
    updateTeam: builder.mutation<TCreateTeamResponse, any>({
      query: ({ body, teamId }) => ({
        url: `/teams/${teamId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Team"],
    }),
  }),
});

export const {
  useGetAllTeamsQuery,
  useDeleteTeamMutation,
  useCreateTeamMutation,
  useUpdateTeamMutation,
} = teamApi;

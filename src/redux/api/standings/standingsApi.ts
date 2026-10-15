import {
  TPlayoffBracketsResponse,
  TRegionStandingsResponse,
} from "@/types/global";
import baseApi from "../baseApi";

export const standingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRegionStandings: builder.query<TRegionStandingsResponse, string>({
      query: (region) => ({
        url: `/standings/regions/${region}`,
        method: "GET",
      }),
      providesTags: ["Standings"],
    }),
    getPlayoffBrackets: builder.query<TPlayoffBracketsResponse, number>({
      query: (roundNumber) => ({
        url: `/standings/playoffs?roundNumber=${roundNumber}`,
        method: "GET",
      }),
      providesTags: ["Standings"],
    }),
  }),
});

export const { useGetRegionStandingsQuery, useGetPlayoffBracketsQuery } =
  standingsApi;

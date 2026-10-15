import { TRegionPayload, TRegionResponse } from "@/types/global";
import baseApi from "../baseApi";

const regionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllRegion: builder.query<TRegionResponse, TRegionPayload>({
      query: () => ({
        url: "/regions",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAllRegionQuery } = regionApi;

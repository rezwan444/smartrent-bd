import baseApi from "../baseApi";
import { TSiteInfoResponse, ISiteInfo } from "@/types/global";

export const siteInfoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSiteInfo: builder.query<TSiteInfoResponse, void>({
      query: () => ({
        url: "/site-info",
        method: "GET",
      }),
      providesTags: ["SiteInfo"],
    }),
    updateSiteInfo: builder.mutation<TSiteInfoResponse, Partial<ISiteInfo>>({
      query: (data) => ({
        url: "/site-info",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["SiteInfo"],
    }),
  }),
});

export const { useGetSiteInfoQuery, useUpdateSiteInfoMutation } = siteInfoApi;

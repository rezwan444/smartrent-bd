import { TAdPayload, TAdResponse, IAdvertisement, IBaseResponse, AdStatus } from "@/types/global";
import baseApi from "../baseApi";

export const adApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAd: builder.mutation<unknown, FormData>({
      query: (body) => ({
        url: "/advertisements",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Ad"],
    }),
    getAllAds: builder.query<TAdResponse, TAdPayload>({
      query: (params) => ({
        url: "/advertisements",
        method: "GET",
        params,
      }),
      providesTags: ["Ad"],
    }),
    deleteAd: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/advertisements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Ad"],
    }),
    updateAd: builder.mutation<unknown, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/advertisements/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Ad"],
    }),
    updateAdStatus: builder.mutation<unknown, { id: string; status: AdStatus }>({
      query: ({ id, status }) => ({
        url: `/advertisements/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Ad"],
    }),
    getAdById: builder.query<IBaseResponse<IAdvertisement>, string>({
      query: (id) => ({
        url: `/advertisements/${id}`,
        method: "GET",
      }),
      providesTags: ["Ad"],
    }),
  }),
});

export const {
  useCreateAdMutation,
  useGetAllAdsQuery,
  useDeleteAdMutation,
  useUpdateAdMutation,
  useUpdateAdStatusMutation,
  useGetAdByIdQuery,
} = adApi;

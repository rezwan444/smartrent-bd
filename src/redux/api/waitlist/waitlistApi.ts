import { baseApi } from "../baseApi";
import { IBaseResponse, IWaitlist, IWaitlistMeta } from "@/types/global";

interface GetWaitlistParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const waitlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWaitlists: builder.query<IBaseResponse<IWaitlist[], IWaitlistMeta>, GetWaitlistParams>({
      query: (params) => ({
        url: "/waitlist",
        method: "GET",
        params,
      }),
      providesTags: ["Waitlist"],
    }),
    updateWaitlistStatus: builder.mutation<
      IBaseResponse<IWaitlist>,
      { id: string; status: string; adminNotes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/waitlist/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Waitlist"],
    }),
    deleteWaitlist: builder.mutation<IBaseResponse<IWaitlist>, string>({
      query: (id) => ({
        url: `/waitlist/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Waitlist"],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetWaitlistsQuery, 
  useUpdateWaitlistStatusMutation,
  useDeleteWaitlistMutation
} = waitlistApi;

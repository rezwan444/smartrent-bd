import baseApi from "../baseApi";
import { TAdminDashboardResponse } from "@/types/global";

export const adminDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboardData: builder.query<TAdminDashboardResponse, void>({
      query: () => ({
        url: "/admin-dashboard",
        method: "GET",
      }),
      providesTags: ["Users", "Team"], // Add appropriate tags if necessary based on invalidation needs
    }),
  }),
});

export const { useGetAdminDashboardDataQuery } = adminDashboardApi;

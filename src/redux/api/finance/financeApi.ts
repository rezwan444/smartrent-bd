import { TFinancialCenterResponse } from "@/types/global";
import baseApi from "../baseApi";

export const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialCenterData: builder.query<TFinancialCenterResponse, void>({
      query: () => ({
        url: "/financial-center",
        method: "GET",
      }),
      providesTags: ["Profile", "Team", "User"], // Just to refresh if related entities change
    }),
  }),
});

export const { useGetFinancialCenterDataQuery } = financeApi;

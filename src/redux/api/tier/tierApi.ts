import { IBaseResponse, ITierStructure, TTierPayload, TTierResponse } from "@/types/global";
import baseApi from "../baseApi";

const tierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTiers: builder.query<TTierResponse, TTierPayload>({
      query: () => ({
        url: "/tier-plan",
        method: "GET",
      }),
      providesTags: ["Tier"],
    }),
    createTierPlan: builder.mutation<IBaseResponse<ITierStructure>, Partial<ITierStructure>>({
      query: (body) => ({
        url: "/tier-plan",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tier"],
    }),
    updateTierPlan: builder.mutation<IBaseResponse<ITierStructure>, { id: string; data: Partial<ITierStructure> }>({
      query: ({ id, data }) => ({
        url: `/tier-plan/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Tier"],
    }),
  }),
});

export const { useGetAllTiersQuery, useCreateTierPlanMutation, useUpdateTierPlanMutation } = tierApi;

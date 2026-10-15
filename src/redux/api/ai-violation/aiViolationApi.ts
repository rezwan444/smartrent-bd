import {
  AiViolationStatus,
  IBaseResponse,
  TAiViolationPayload,
  TAiViolationResponse,
  TSingleAiViolationResponse,
} from "@/types/global";
import baseApi from "../baseApi";

export const aiViolationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAiViolations: builder.query<TAiViolationResponse, TAiViolationPayload>({
      query: (payload) => {
        const params = new URLSearchParams();
        if (payload.page) params.append("page", payload.page.toString());
        if (payload.limit) params.append("limit", payload.limit.toString());
        if (payload.status) params.append("status", payload.status);

        return {
          url: `/ai-violations?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Violations", "Users", "Team"],
    }),
    getAiViolationById: builder.query<TSingleAiViolationResponse, string>({
      query: (id) => ({
        url: `/ai-violations/${id}`,
        method: "GET",
      }),
      providesTags: ["Violations", "Users", "Team"],
    }),
    updateAiViolationStatus: builder.mutation<
      TSingleAiViolationResponse,
      { id: string; status: AiViolationStatus; adminNote?: string }
    >({
      query: ({ id, ...data }) => ({
        url: `/ai-violations/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Violations", "Users", "Team"],
    }),
    deleteAiViolation: builder.mutation<IBaseResponse<null>, string>({
      query: (id) => ({
        url: `/ai-violations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Violations", "Users", "Team"],
    }),
  }),
});

export const {
  useGetAiViolationsQuery,
  useGetAiViolationByIdQuery,
  useUpdateAiViolationStatusMutation,
  useDeleteAiViolationMutation,
} = aiViolationApi;

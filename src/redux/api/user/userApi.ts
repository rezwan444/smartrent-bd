import { IAdminProfile, IBaseResponse, ISuspendedUser, AccountStatus } from "@/types/global";
import baseApi from "../baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateOwnProfile: builder.mutation<IBaseResponse<IAdminProfile>, FormData>({
      query: (data) => ({
        url: "/user/me",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User", "Profile"], // Add "Profile" or "User" tag invalidation
    }),
    getOwnProfile: builder.query<IBaseResponse<IAdminProfile>, void>({
      query: () => ({
        url: "/user/me",
        method: "GET",
      }),
      providesTags: ["User", "Profile"],
    }),
    getAllUsers: builder.query<IBaseResponse<IAdminProfile[]>, Record<string, string | number | undefined>>({
      query: (params) => ({
        url: "/user",
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),
    getUserById: builder.query<IBaseResponse<IAdminProfile>, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    updateUserStatus: builder.mutation<IBaseResponse<IAdminProfile>, { id: string; status: AccountStatus }>({
      query: ({ id, status }) => ({
        url: `/user/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }, "User"],
    }),
    getSuspendedUsers: builder.query<IBaseResponse<ISuspendedUser[]>, void>({
      query: () => ({
        url: "/user/suspended",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    deleteUser: builder.mutation<IBaseResponse<IAdminProfile>, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "User", id }, "User"],
    }),
    inviteAdmin: builder.mutation<IBaseResponse<IAdminProfile>, { name: string; email: string; customMessage?: string; password?: string }>({
      query: (data) => ({
        url: "/user/invite-admin",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useUpdateOwnProfileMutation, useGetOwnProfileQuery, useGetAllUsersQuery, useGetUserByIdQuery, useUpdateUserStatusMutation, useGetSuspendedUsersQuery, useDeleteUserMutation, useInviteAdminMutation } = userApi;

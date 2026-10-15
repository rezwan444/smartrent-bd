import {
  IForgotPasswordPayload,
  IForgotPasswordResponse,
  ILoginPayload,
  ILoginResponse,
  IResendOTPBaseResponse,
  IResendOTPReqBody,
  IResetPasswordPayload,
  IResetPasswordResponse,
  IVerifyOTPPayload,
  IVerifyOTPResponse,
  IBaseResponse,
} from "@/types/global";
import baseApi from "../baseApi";

export interface IChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ILoginResponse, ILoginPayload>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    forgotPassword: builder.mutation<
      IForgotPasswordResponse,
      IForgotPasswordPayload
    >({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    // resetPassword: builder.mutation<
    //   IResetPasswordResponse,
    //   IResetPasswordPayload
    // >({
    //   query: (body) => ({
    //     url: "/auth/reset-password",
    //     method: "POST",
    //     body,
    //   }),
    // }),
    resetPassword: builder.mutation<
      IResetPasswordResponse,
      IResetPasswordPayload
    >({
      query: ({ newPassword, confirmPassword, token }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: { newPassword, confirmPassword },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    resendOtp: builder.mutation<IResendOTPBaseResponse, IResendOTPReqBody>({
      query: (body) => ({
        url: "/auth/forgot-password",
        // url: "/auth/resend-otp",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation<IVerifyOTPResponse, IVerifyOTPPayload>({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: { otp: body.otp, type: body.type },
        headers: {
          Authorization: `Bearer ${body.verificationToken}`,
        },
      }),
    }),
    changePassword: builder.mutation<IBaseResponse<null>, IChangePasswordPayload>({
      query: (body) => ({
        url: "/auth/change-password",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendOtpMutation,
  useVerifyOtpMutation,
  useChangePasswordMutation,
} = authApi;

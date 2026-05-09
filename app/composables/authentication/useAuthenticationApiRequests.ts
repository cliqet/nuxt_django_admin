import type { SignInFormPayload, SignInResponseData } from "~/shared/types/pages/login";

export const useAuthenticationApiRequests = () => {
  const { publicApi } = useApiClients();

  const loginRequest = (body: SignInFormPayload) => publicApi<SignInResponseData>(
    'users/login',
    {
      body,
      method: 'post',
      credentials: 'include',
    },
  );

  const verifyCloudflareToken = (token: string) => publicApi<{ isValid: boolean }>(
    'verify-cloudflare-token',
    {
      body: { token },
      method: 'post'
    }
  )

  return {
    loginRequest,
    verifyCloudflareToken,
  }
}
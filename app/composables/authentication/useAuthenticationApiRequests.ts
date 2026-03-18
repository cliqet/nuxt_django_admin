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

  return {
    loginRequest
  }
}
import { toast } from "vue-sonner";
import { ACCESS_TOKEN_KEY } from "~/shared/constants/app";
import { PublicRoute } from "~/shared/constants/routes";
import { TOAST_ERROR_STYLE } from "~/shared/constants/ui";


export const useApiClients = () => {
  const config = useRuntimeConfig();
  const userStore = useUserStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logError = (data: any) => {
    console.log("useApiClient log", data);
  };

  const publicApi = $fetch.create({
    baseURL: config.public.apiEndpoint,
    onRequest: ({ options }) => {
      if (import.meta.server) {
        options.headers.set("Origin", `http://${config.public.domainName}`);
      }
    },
    onRequestError: ({ error, request, response, options }) => {
      logError({
        error: error.stack,
        request,
        response,
        options,
      });
    },
    onResponseError: async ({ response, error, request, options }) => {
      logError({
        error: error?.stack,
        request,
        response,
        options,
      });

      let message = "Something went wrong with your request";

      if (response.status >= 400) {
        try {
          if (
            response.headers.get("Content-Type")?.includes("application/json")
          ) {
            const jsonResponse = await response.json(); // Await the JSON parsing
            message = jsonResponse.message; // Use message from JSON if available
          }
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError);
          message = response._data.detail ?? message;
        }

        toast("Response Error", {
          description: message,
          style: TOAST_ERROR_STYLE,
        });
        console.log("RESPONSE", message);
      }
    },
  });

  const privateApi = $fetch.create({
    baseURL: config.public.apiEndpoint,
    credentials: "include",
    onRequest: ({ options }) => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (accessToken) {
        options.headers.set("Authorization", `Bearer ${accessToken}`);
      }

      if (import.meta.server) {
        options.headers.set("Origin", `http://${config.public.domainName}`);
      }
    },

    onRequestError: ({ error, request, response, options }) => {
      logError({
        error: error.stack,
        request,
        response,
        options,
      });
    },

    onResponseError: async ({ response, error, request, options }) => {
      logError({
        error: error?.stack,
        request,
        response,
        options,
      });

      if (response.status === 401) {
        userStore.setUser(null);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        await navigateTo(PublicRoute.Login);
      }
    },
  });

  return {
    publicApi,
    privateApi,
  };
};

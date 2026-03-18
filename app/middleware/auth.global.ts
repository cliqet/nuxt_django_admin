import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN_KEY } from "~/shared/constants/app";
import { PublicRoute } from "~/shared/constants/routes";
import type { TokenPayload } from "~/shared/types/user";

export default defineNuxtRouteMiddleware((to, _) => {
  const userStore = useUserStore();

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    const noAuthRoutes: string[] = [PublicRoute.Login];

    if (!noAuthRoutes.some(route => to.fullPath.startsWith(route))) {
      return navigateTo(`${PublicRoute.Login}?redirect=${to.fullPath}`);
    }
  } else {
    try {
      const tokenPayload: TokenPayload = jwtDecode(token);

      // Set user in the store
      userStore.setUser(tokenPayload);

      if ([PublicRoute.Login as string].includes(to.fullPath)) {
        return navigateTo("/console");
      }
    } catch (err) {
      console.error("Error", err);
      if ([PublicRoute.Login as string].includes(to.fullPath)) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      } else {
        return navigateTo(PublicRoute.Login);
      }
    }
  }
});


import { defineStore } from "pinia";
import type { User, UserPermissions } from "~/shared/types/user";

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const userPermissions = ref<UserPermissions>({});

  function setUser (userPayload: User | null) {
    user.value = userPayload;
  }

  function setUserPermissions(permissions: UserPermissions) {
    userPermissions.value = permissions;
  }

  return {
    user,
    userPermissions,
    setUser,
    setUserPermissions,
  }
})
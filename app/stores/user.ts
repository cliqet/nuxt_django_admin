import { defineStore } from "pinia";
import type { User } from "~/shared/types/user";

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);

  function setUser (userPayload: User | null) {
    user.value = userPayload;
  }

  return {
    user,
    setUser
  }
})
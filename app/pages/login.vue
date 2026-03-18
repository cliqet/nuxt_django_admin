<script setup lang="ts">
import { useAuthenticationApiRequests } from "~/composables/authentication/useAuthenticationApiRequests";
import { jwtDecode } from "jwt-decode";
import type { TokenPayload } from "~/shared/types/user";
import { ACCESS_TOKEN_KEY } from "~/shared/constants/app";
import { DashboardRoute } from "~/shared/constants/routes";
import { useVuelidate } from "@vuelidate/core";
import { required, email } from "@vuelidate/validators";

definePageMeta({
  layout: "unauthenticated",
});

const route = useRoute();

const userStore = useUserStore();

const { loginRequest } = useAuthenticationApiRequests();

const loginForm = ref({
  email: "",
  password: "",
});
const rules = {
  email: { required, email },
  password: { required },
};

const v$ = useVuelidate(rules, loginForm);

const handleLogin = async () => {
  const isValid = await v$.value.$validate();

  if (!isValid) {
    return;
  }

  const response = await loginRequest(loginForm.value);

  const tokenPayload: TokenPayload = jwtDecode(response.access);
  userStore.setUser(tokenPayload);
  localStorage.setItem(ACCESS_TOKEN_KEY, response.access);

  const redirectPath: string = route.query.redirect as string;

  if (redirectPath) {
    await navigateTo(redirectPath);
  } else {
    await navigateTo(DashboardRoute.DashboardHome);
  }
};
</script>

<template>
  <main
    class="flex items-center justify-center px-3 md:px-10 py-3 w-full overflow-y-auto"
  >
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-primary">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin">
          <div class="grid w-full items-center gap-4">
            <div class="flex flex-col space-y-1.5">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="loginForm.email"
                type="email"
                placeholder="m@example.com"
              />
              <span
                v-if="v$.email.$invalid && v$.email.$dirty"
                class="text-red-500 text-xs"
              >
                {{ v$.email.$errors[0]?.$message }}
              </span>
            </div>

            <div class="flex flex-col space-y-1.5">
              <div class="flex items-center">
                <Label for="password">Password</Label>
              </div>
              <Input
                id="password"
                v-model="loginForm.password"
                type="password"
              />
              <span
                v-if="v$.password.$invalid && v$.password.$dirty"
                class="text-red-500 text-xs"
              >
                {{ v$.password.$errors[0]?.$message }}
              </span>
            </div>
          </div>

          <div class="flex flex-col gap-2 mt-8">
            <Button
              class="w-full cursor-pointer"
              type="submit"
              @click="handleLogin"
            >
              Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </main>
</template>

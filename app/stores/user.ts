import { defineStore } from "pinia";
import type { ModelPermissionType } from "~/shared/types/app";
import type {
  AppPermissionType,
  User,
  UserAppModelPermissionsType,
} from "~/shared/types/user";

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null);
  const userAppModelPermissions = ref<UserAppModelPermissionsType>({});

  function setUser(userPayload: User | null) {
    user.value = userPayload;
  }

  function setUserAppModelPermissions() {
    const appStore = useAppStore();

    const permissions: Record<string, AppPermissionType> = {};

    appStore.appSettings.forEach((app) => {
      const modelPermsObj: Record<string, { perms: ModelPermissionType }> = {};

      app.models.forEach((model) => {
        modelPermsObj[model.objectName.toLowerCase()] = { perms: model.perms };
      });

      permissions[app.appLabel] = {
        hasModulePerms: app.hasModulePerms,
        modelPerms: modelPermsObj,
      };
    });

    userAppModelPermissions.value = permissions;
  }

  function hasAddPermission(appName: string, modelName: string) {
    return userAppModelPermissions.value[appName]?.modelPerms[modelName]?.perms
      .add;
  }

  function hasViewPermission(appName: string, modelName: string) {
    return userAppModelPermissions.value[appName]?.modelPerms[modelName]?.perms
      .view;
  }

  function hasChangePermission(appName: string, modelName: string) {
    return userAppModelPermissions.value[appName]?.modelPerms[modelName]?.perms
      .change;
  }

  function hasDeletePermission(appName: string, modelName: string) {
    return userAppModelPermissions.value[appName]?.modelPerms[modelName]?.perms
      .delete;
  }

  return {
    user,
    userAppModelPermissions,
    setUser,
    setUserAppModelPermissions,
    hasAddPermission,
    hasChangePermission,
    hasDeletePermission,
    hasViewPermission
  };
});

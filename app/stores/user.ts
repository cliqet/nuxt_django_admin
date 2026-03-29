import { defineStore } from "pinia";
import type { ModelPermissionType } from "~/shared/types/app";
import type { AppPermissionType, User, UserAppModelPermissionsType, UserPermissions } from "~/shared/types/user";

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const userPermissions = ref<UserPermissions>({});
  const userAppModelPermissions = ref<UserAppModelPermissionsType>({});

  function setUser (userPayload: User | null) {
    user.value = userPayload;
  }

  function setUserPermissions(permissions: UserPermissions) {
    userPermissions.value = permissions;
  }

  function setUserAppModelPermissions () {
    const appStore = useAppStore();

    const permissions: Record<string, AppPermissionType> = {};

    appStore.appSettings.forEach(app => {
      const modelPermsObj: Record<string, { perms: ModelPermissionType }> = {};

      app.models.forEach(model => {
        modelPermsObj[model.objectName.toLowerCase()] = { perms: model.perms }
      });

      permissions[app.name] = {
        hasModulePerms: app.hasModulePerms,
        modelPerms: modelPermsObj
      }
    });

    userAppModelPermissions.value = permissions;
  }

  return {
    user,
    userPermissions,
    userAppModelPermissions,
    setUser,
    setUserPermissions,
    setUserAppModelPermissions,
  }
})
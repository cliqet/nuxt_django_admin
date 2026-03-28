export type PermActions = 'add' | 'view' | 'change' | 'delete';

export type ModelPermission = {
    id: number;
    perms: Record<string, number>;
    perms_ids: Record<string, PermActions>;
}

export type UserModelPermission = Record<string, ModelPermission>;

export type UserPermissions = Record<string, UserModelPermission>;

export type Permission = {
  id: number;
  name: string;
  contentTypeId: number;
  codename: string;
}

export type Group = {
  id: number;
  name: string;
  permissionIds: number[];
}

export type User = {
    user_id : string;
    uid : string;
    first_name : string;
    last_name : string;
    email : string;
    is_superuser : boolean;
    is_staff : boolean;
    is_active : boolean;
    initials : string;
    session_id : string;
}

export type TokenPayload = User & {
    token_type : string;
    exp : number;
    iat : number;
    jti : number;
    iss : string;
}
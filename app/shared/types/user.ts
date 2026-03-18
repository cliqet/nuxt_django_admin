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
export interface BaseUser {
    uid: string;
    username: string;
    password: string;
}

export interface User extends BaseUser {
    data: UserData;
}

export interface SerializedUser extends BaseUser {
    data: string;
}

export interface UserData {
    signingKey: string;
}
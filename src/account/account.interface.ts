export interface AccountBase {
    identifier: string;
    owner: string;
    name: string;
}

export interface Account extends AccountBase {
    data: AccountData;
}

export interface SerializedAccount extends AccountBase {
    data: string;
}

export interface AccountData {
    balance: number;
}
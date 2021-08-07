export interface IAccount {
    _id?: string;
    owner?: string;
    status?: boolean;
    address?: string;
    provider: string;
    name: string;
    apiKey?: string;
    apiSecret?: string;
    apiPassPhrase?: string;
    subAccountId?: string;
    description?: string;
    createDate?: string;
    updatedDate?: string;
    createdBy?: string;
    updatedBy?: string;
    active?: boolean;
    dex?: boolean;
    testnet?: boolean;
}

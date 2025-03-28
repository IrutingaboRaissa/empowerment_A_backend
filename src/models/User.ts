
export interface User {
    id: string;
    email: string;
    password: string;
    phoneNumber?: string;
    address?: string;
    bio?: string;       
    displayName: string;
    age: number;
    category: string;
    parentConsent: boolean;
    avatar?: string;
    tokens?: string[];
    createdAt: Date;
    updatedAt: Date;
}
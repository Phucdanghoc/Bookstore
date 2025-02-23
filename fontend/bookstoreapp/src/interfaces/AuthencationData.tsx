interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
}

interface AuthencationData {
    user: any;
    token: string;
}
interface VerifyData {
    access: boolean;
    role: string;
}
export type { LoginData, RegisterData, AuthencationData, VerifyData };
export interface UserProfile {
    displayName: string;
    avatar?:string|null;
    email?: string;
    phone?: string;
    department?: string;
    jobTitle?: string;
    registrationNumber?: string;
    version: number;
    clearance: string;
    organizations: string[];
    sessionExpiresAt: string;
}

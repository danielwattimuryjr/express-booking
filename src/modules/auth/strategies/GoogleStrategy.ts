/**
 * Google OAuth is intentionally opt-in. Configure a provider before registering a
 * Passport strategy so applications that only use JWT authentication need no OAuth credentials.
 */
export interface GoogleProfile {
    id: string;
    email: string;
}

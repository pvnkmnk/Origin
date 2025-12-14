export function getSessionCookieOptions(_req) {
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/",
    };
}

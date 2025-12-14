export async function createContext(opts) {
    const openIdHeader = (opts.req.headers["x-openid"] || opts.req.headers["x-open-id"]);
    const user = openIdHeader
        ? {
            openId: openIdHeader,
            role: "user",
        }
        : null;
    return {
        req: opts.req,
        res: opts.res,
        user,
    };
}

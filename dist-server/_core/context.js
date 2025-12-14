export async function createContext(opts) {
    // TODO: In Phase B auth, parse session cookie or header to identify user
    return {
        req: opts.req,
        res: opts.res,
        user: null,
    };
}

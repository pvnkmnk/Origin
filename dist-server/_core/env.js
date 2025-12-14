export const ENV = {
    nodeEnv: (process.env.NODE_ENV || "development"),
    ownerOpenId: process.env.OWNER_OPEN_ID || "owner-dev-openid",
    databaseUrl: process.env.DATABASE_URL || "",
};

declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL?: string;
    REDIS_URL?: string;
    JWT_SECRET?: string;
    MATCHER_URL?: string;
    PORT?: string;
    LOG_LEVEL?: "debug" | "info" | "warn" | "error";
  }
}

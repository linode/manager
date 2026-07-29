/// <reference types="./vite.d.ts" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    /**
     * The Launch Darkly ID for the production environment
     */
    readonly PROD_LD_ID?: string;
    /**
     * The API URL for the production environment
     */
    readonly PROD_API_URL?: string;
    /**
     * The Launch Darkly ID for the staging environment
     */
    readonly STAGING_LD_ID?: string;
    /**
     * The API URL for the staging environment
     */
    readonly STAGING_API_URL?: string;
    /**
     * The Launch Darkly ID for the development environment
     */
    readonly DEV_CLOUD_LD_ID?: string;
    /**
     * The API URL for the development environment
     */
    readonly DEV_CLOUD_API_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

import { Environment } from "./CloudPulseContextualDashboard";
import envConfig from '../env.config.json';

export interface EnvironmentConfig {
    /**
     * Launch Darkly ID for the environment. Used to initialize the Launch Darkly client
     */
    ldId: string;
    /**
     * API URL for the environment. Used to make API requests to the Linode API
     */
    apiUrl: string;
}

export const CLOUDPULSE_ENV_MAP: Record<Environment, EnvironmentConfig> = {
    production: {
        // These values are set when the build is run
        ldId: import.meta.env.PROD_LD_ID || envConfig.production.ldId,
        apiUrl: import.meta.env.PROD_API_URL || envConfig.production.apiUrl,
    },
    staging: {
        ldId: import.meta.env.STAGING_LD_ID || envConfig.staging.ldId,
        apiUrl: import.meta.env.STAGING_API_URL || envConfig.staging.apiUrl,
    },
    devcloud: {
        ldId: import.meta.env.DEV_CLOUD_LD_ID || envConfig.devcloud.ldId,
        apiUrl: import.meta.env.DEV_CLOUD_API_URL || envConfig.devcloud.apiUrl,
    },
};
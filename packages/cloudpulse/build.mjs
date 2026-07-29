#!/usr/bin/env node
/**
 * Build script for CloudPulse that injects environment variables from centralized config
 */
import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const config = require('./env.config.json');

const envVars = {
    PROD_LD_ID: config.production.ldId,
    PROD_API_URL: config.production.apiUrl,
    STAGING_LD_ID: config.staging.ldId,
    STAGING_API_URL: config.staging.apiUrl,
    DEV_CLOUD_LD_ID: config.devcloud.ldId,
    DEV_CLOUD_API_URL: config.devcloud.apiUrl,
};

// Convert to command-line format
const envString = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');

try {
    execSync(`${envString} vite build`, {
        stdio: 'inherit',
        cwd: process.cwd(),
    });
} catch (error) {
    process.exit(1);
}

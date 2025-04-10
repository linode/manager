import type { ConfigurationOption } from './DatabaseConfigurationSelect';
import type { APIError } from '@linode/api-v4';

/**
 * Finds the API error for a specific configuration.
 */
export const getConfigAPIError = (
  config: ConfigurationOption,
  updateDatabaseError: APIError[] | null
): string | undefined => {
  if (!updateDatabaseError || !Array.isArray(updateDatabaseError)) {
    return undefined;
  }

  const error = updateDatabaseError.find(
    (error) =>
      error.field === `engine_config.${config.category}.${config.label}`
  );

  return error?.reason;
};

/**
 * Determines if a restart is required based on dirty fields.
 */
export const hasRestartCluster = (
  dirtyFields: any,
  configs: ConfigurationOption[]
): string => {
  return Object.keys(dirtyFields.configs || {}).some(
    (key) => configs[Number(key)]?.requires_restart
  )
    ? 'Save and Restart Service'
    : 'Save';
};

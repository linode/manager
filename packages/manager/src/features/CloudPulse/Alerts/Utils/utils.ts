import type { ServiceTypesList } from '@linode/api-v4';
import type { Theme } from '@mui/material';

/**
 * @param serviceType Service type for which the label needs to be displayed
 * @param serviceTypes List of available service types in ACLP
 * @returns The label for the given service type
 */
export const getServiceTypeLabel = (
  serviceType: string,
  serviceTypes: ServiceTypesList | undefined
) => {
  if (!serviceTypes) {
    return serviceType;
  }

  for (const service of serviceTypes?.data) {
    if (service.service_type === serviceType) {
      return service.label;
    }
  }

  return serviceType;
};

/**
 *
 * @param theme mui theme
 * @returns The style needed for box in alerts
 */
export const getAlertBoxStyles = (theme: Theme) => ({
  backgroundColor: theme.tokens.background.Neutral,
  padding: theme.spacing(3),
});

/**
 * Converts seconds into a human-readable minutes and seconds format.
 *
 * @param seconds The seconds that need to be converted into minutes.
 * @returns A string representing the time in minutes and seconds.
 */
export const convertSecondsToMinutes = (seconds: number): string => {
  if (seconds === 0) {
    return '0 minutes';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const minuteString = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  const secondString = `${remainingSeconds} ${
    remainingSeconds === 1 ? 'second' : 'seconds'
  }`;

  if (!minutes) {
    return secondString;
  }
  if (!remainingSeconds) {
    return minuteString;
  }

  return `${minuteString} and ${secondString}`;
};

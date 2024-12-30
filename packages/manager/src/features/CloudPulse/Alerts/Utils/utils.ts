import type { ServiceTypesList } from '@linode/api-v4';
import { Theme } from '@mui/material';

/**
 * @param timestamp The timestamp that needs to be converted
 * @returns Formatted date string for a given timestamp, e.g., Nov 30, 2024, 12:42PM
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);

  // Intl.DateTimeFormat directly supports custom formatting
  const formatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: 'numeric',
    hour12: true,
    minute: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return formatter.format(date);
};

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
  backgroundColor:
    theme.name === 'light' ? theme.color.grey5 : theme.color.grey9,
  padding: theme.spacing(3),
});

import type { ServiceTypesList } from '@linode/api-v4';
import type { Theme } from '@mui/material';

/**
 * @param serviceType Service type for which the label needs to be displayed
 * @param serviceTypes List of available service types in cloud pulse
 * @returns The label for the given service type
 */
export const getServiceTypeLabel = (
  serviceType: string,
  serviceTypes: ServiceTypesList | undefined
) => {
  if (!serviceTypes) {
    return serviceType;
  }

  return (
    serviceTypes.data.find(
      ({ service_type: serviceTypeObj }) => serviceTypeObj === serviceType
    )?.label || serviceType
  );
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

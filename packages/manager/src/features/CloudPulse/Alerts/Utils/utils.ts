import type { ServiceTypesList } from '@linode/api-v4';
import type { Theme } from '@mui/material';

/**
 * @param serviceType Service type for which the label needs to be displayed
 * @param serviceTypes List of available service types in Cloud Pulse
 * @returns The label for the given service type, or the serviceType itself if not found or serviceTypes is undefined.
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
 * @param theme MUI theme object
 * @returns The style object for the alert box, including background color and padding
 */
export const getAlertBoxStyles = (theme: Theme) => ({
  backgroundColor:
    theme.name === 'light' ? theme.color.grey5 : theme.color.grey9,
  padding: theme.spacing(3),
});

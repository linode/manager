import type { ServiceTypesList } from '@linode/api-v4';
import type { Theme } from '@mui/material';

/**
 * @param serviceType Service type for which the label needs to be displayed
 * @param serviceTypes List of available service types in Cloud Pulse
 * @returns The label for the given service type from available service types
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
 * @returns The style object for the box used in alert details page
 */
export const getAlertBoxStyles = (theme: Theme) => ({
  backgroundColor:
    theme.name === 'light'
      ? theme.tokens.color.Neutrals[5]
      : theme.tokens.color.Neutrals.Black,
  padding: theme.spacing(3),
});

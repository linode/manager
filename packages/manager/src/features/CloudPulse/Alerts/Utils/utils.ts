import type { ServiceTypesList } from '@linode/api-v4';
import type { Theme } from '@mui/material';

/**
 * @param serviceType Service type for which the label needs to be displayed
 * @param serviceTypeList List of available service types in Cloud Pulse
 * @returns The label for the given service type from available service types
 */
export const getServiceTypeLabel = (
  serviceType: string,
  serviceTypeList: ServiceTypesList | undefined
) => {
  if (!serviceTypeList) {
    return serviceType;
  }

  return (
    serviceTypeList.data.find(
      ({ service_type: serviceTypeObj }) => serviceTypeObj === serviceType
    )?.label || serviceType
  );
};

/**
 * @param theme MUI theme object
 * @returns The style object for the box used in alert details page
 */
export const getAlertBoxStyles = (theme: Theme) => ({
  backgroundColor: theme.tokens.background.Neutral,
  padding: theme.spacing(3),
});
/**
 * Converts seconds into a human-readable minutes and seconds format.
 * @param seconds The seconds that need to be converted into minutes.
 * @returns A string representing the time in minutes and seconds.
 */
export const convertSecondsToMinutes = (seconds: number): string => {
  if (seconds <= 0) {
    return '0 minute';
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const minuteString =
    minutes > 0 ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}` : '';
  const secondString =
    remainingSeconds > 0
      ? `${remainingSeconds} ${remainingSeconds === 1 ? 'second' : 'seconds'}`
      : '';
  return [minuteString, secondString].filter(Boolean).join(' and ');
};
/**
 * @param index  The index of the list of chips that we are rendering
 * @param length The length of the iteration so far
 * @param mergeChips Indicates if the chips are merged into single or individual
 * @param theme The MUI theme object
 * @returns The border radius to be applied on chips based on the parameters
 */
export const getAlertChipBorderRadius = (
  index: number,
  length: number,
  mergeChips: boolean | undefined,
  theme: Theme
): string => {
  if (!mergeChips || length === 1) {
    return theme.spacing(0.3);
  }
  if (index === 0) {
    return `${theme.spacing(0.3)} 0 0 ${theme.spacing(0.3)}`;
  }
  if (index === length - 1) {
    return `0 ${theme.spacing(0.3)} ${theme.spacing(0.3)} 0`;
  }
  return '0';
};

import { aggregationTypeMap, metricOperatorTypeMap } from '../constants';

import type { AlertDimensionsProp } from '../AlertsDetail/DisplayAlertDetailChips';
import type {
  Alert,
  AlertDefinitionMetricCriteria,
  AlertDefinitionType,
  NotificationChannel,
  ServiceTypesList,
} from '@linode/api-v4';
import type { Theme } from '@mui/material';

interface AlertChipBorderProps {
  /**
   * The radius needed for the border
   */
  borderRadiusPxValue: string;
  /**
   * The index of the chip
   */
  index: number;
  /**
   * The total length of the chips to be build
   */
  length: number;

  /**
   * Indicates Whether to merge the chips into single or keep it individually
   */
  mergeChips: boolean | undefined;
}

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
    return '0 minutes';
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
 * @param props The props/parameters needed to determine the alert chip's border
 * @returns The border radius to be applied on chips based on the parameters
 */
export const getAlertChipBorderRadius = (
  props: AlertChipBorderProps
): string => {
  const { borderRadiusPxValue, index, length, mergeChips } = props;
  if (!mergeChips || length === 1) {
    return borderRadiusPxValue;
  }
  if (index === 0) {
    return `${borderRadiusPxValue} 0 0 ${borderRadiusPxValue}`;
  }
  if (index === length - 1) {
    return `0 ${borderRadiusPxValue} ${borderRadiusPxValue} 0`;
  }
  return '0';
};

/**
 * @param value The notification channel object for which we need to display the chips
 * @returns The label and the values that needs to be displayed based on channel type
 */
export const getChipLabels = (
  value: NotificationChannel
): AlertDimensionsProp => {
  if (value.channel_type === 'email') {
    return {
      label: 'To',
      values: value.content.email.email_addresses,
    };
  } else if (value.channel_type === 'slack') {
    return {
      label: 'Slack Webhook URL',
      values: [value.content.slack.slack_webhook_url],
    };
  } else if (value.channel_type === 'pagerduty') {
    return {
      label: 'Service API Key',
      values: [value.content.pagerduty.service_api_key],
    };
  } else {
    return {
      label: 'Webhook URL',
      values: [value.content.webhook.webhook_url],
    };
  }
};

export interface ProcessedCriteria {
  aggregationType: string;
  label: string;
  operator: string;
  threshold: number;
  unit: string;
}

export const processMetricCriteria = (
  criterias: AlertDefinitionMetricCriteria[]
): ProcessedCriteria[] => {
  return criterias
    .map((criteria) => {
      const { aggregate_function, label, operator, threshold, unit } = criteria;
      return {
        aggregationType: aggregationTypeMap[aggregate_function],
        label,
        operator: metricOperatorTypeMap[operator],
        threshold,
        unit,
      };
    })
    .reduce<ProcessedCriteria[]>((previousValue, currentValue) => {
      previousValue.push(currentValue);
      return previousValue;
    }, []);
};

export const filterAlertsByStatusAndType = (
  alerts: Alert[] | undefined,
  searchText: string,
  selectedType: string | undefined
): Alert[] => {
  return (
    alerts?.filter((alert) => {
      return (
        alert.status === 'enabled' &&
        (!selectedType || alert.type === selectedType) &&
        (!searchText ||
          alert.label.toLowerCase().includes(searchText.toLowerCase()))
      );
    }) ?? []
  );
};

export const convertAlertsToTypeSet = (
  alerts: Alert[] | undefined
): { label: AlertDefinitionType }[] => {
  const types = new Set(alerts?.map((alert) => alert.type) ?? []);

  return Array.from(types).reduce(
    (previousValue, type) => [...previousValue, { label: type }],
    []
  );
};

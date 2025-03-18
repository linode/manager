import { array, object, string } from 'yup';

import { aggregationTypeMap, metricOperatorTypeMap } from '../constants';

import type { AlertDimensionsProp } from '../AlertsDetail/DisplayAlertDetailChips';
import type { CreateAlertDefinitionForm } from '../CreateAlert/types';
import type {
  Alert,
  AlertDefinitionMetricCriteria,
  AlertDefinitionType,
  AlertServiceType,
  EditAlertDefinitionPayload,
  EditAlertPayloadWithService,
  NotificationChannel,
  ServiceTypesList,
} from '@linode/api-v4';
import type { Theme } from '@mui/material';
import type { AclpAlertServiceTypeConfig } from 'src/featureFlags';
import type { ObjectSchema } from 'yup';

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

export interface ProcessedCriteria {
  /**
   * Label for the metric criteria
   */
  label: string;
  /**
   * Aggregation type for the metric criteria
   */
  metricAggregationType: string;
  /**
   * Comparison operator for the metric criteria
   */
  metricOperator: string;
  /**
   * Threshold value for the metric criteria
   */
  threshold: number;
  /**
   * Unit for the threshold value
   */
  unit: string;
}

export interface AlertValidationSchemaProps {
  /**
   * The config that holds the maxResourceSelection count per service type like linode, dbaas etc.,
   */
  aclpAlertServiceTypeConfig: AclpAlertServiceTypeConfig[];

  /**
   * The service type that is linked with alert and for which the validation schema needs to be built
   */
  serviceTypeObj: null | string;
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

/**
 *
 * @param alerts list of alerts to be filtered
 * @param searchText text to be searched in alert name
 * @param selectedType selecte alert type
 * @returns list of filtered alerts based on searchText & selectedType
 */
export const filterAlertsByStatusAndType = (
  alerts: Alert[] | undefined,
  searchText: string,
  selectedType: string | undefined
): Alert[] => {
  return (
    alerts?.filter(({ label, status, type }) => {
      return (
        status === 'enabled' &&
        (!selectedType || type === selectedType) &&
        (!searchText || label.toLowerCase().includes(searchText.toLowerCase()))
      );
    }) ?? []
  );
};

/**
 *
 * @param alerts list of alerts
 * @returns list of unique alert types in the alerts list in the form of json object
 */
export const convertAlertsToTypeSet = (
  alerts: Alert[] | undefined
): { label: AlertDefinitionType }[] => {
  const types = new Set(alerts?.map(({ type }) => type) ?? []);

  return Array.from(types).reduce(
    (previousValue, type) => [...previousValue, { label: type }],
    []
  );
};

/**
 * Filters and maps the alert data to match the form structure.
 * @param alert The alert object to be mapped.
 * @param serviceType The service type for the alert.
 * @returns The formatted alert values suitable for the form.
 */
export const convertAlertDefinitionValues = (
  {
    alert_channels,
    description,
    entity_ids,
    id,
    label,
    rule_criteria,
    severity,
    tags,
    trigger_conditions,
  }: Alert,
  serviceType: AlertServiceType
): EditAlertPayloadWithService => {
  return {
    alertId: id,
    channel_ids: alert_channels.map((channel) => channel.id),
    description: description || undefined,
    entity_ids,
    label,
    rule_criteria: {
      rules: rule_criteria.rules.map((rule) => ({
        ...rule,
        dimension_filters:
          rule.dimension_filters?.map(({ label, ...filter }) => filter) ?? [],
      })),
    },
    serviceType,
    severity,
    tags,
    trigger_conditions,
  };
};

/**
 *
 * @param criterias list of metric criterias to be processed
 * @returns list of metric criterias in processed form
 */
export const processMetricCriteria = (
  criterias: AlertDefinitionMetricCriteria[]
): ProcessedCriteria[] => {
  return criterias.map(
    ({ aggregate_function, label, operator, threshold, unit }) => {
      return {
        label,
        metricAggregationType: aggregationTypeMap[aggregate_function],
        metricOperator: metricOperatorTypeMap[operator],
        threshold,
        unit,
      };
    }
  );
};

/**
 * @param props The props required foe the max selection count calculation
 * @param createSchema The schema in which the entity id max validation will be added
 * @returns The updated schema with entity id max validation based on max selection count
 */
export const getCreateSchemaWithEntityIdValidation = (
  props: AlertValidationSchemaProps,
  createSchema: ObjectSchema<CreateAlertDefinitionForm>
): ObjectSchema<CreateAlertDefinitionForm> => {
  const { aclpAlertServiceTypeConfig, serviceTypeObj } = props;
  const maxSelectionCount = aclpAlertServiceTypeConfig.find(
    (config) => config && serviceTypeObj === config.serviceType
  )?.maxResourceSelectionCount;

  return !maxSelectionCount
    ? createSchema
    : createSchema.concat(getEntityIdWithMax(maxSelectionCount));
};

/**
 * @param props The props required foe the max selection count calculation
 * @param createSchema The schema in which the entity id max validation will be added
 * @returns The updated schema with entity id max validation based on max selection count
 */
export const getEditSchemaWithEntityIdValidation = (
  props: AlertValidationSchemaProps,
  editSchema: ObjectSchema<EditAlertDefinitionPayload>
): ObjectSchema<EditAlertDefinitionPayload> => {
  const { aclpAlertServiceTypeConfig, serviceTypeObj } = props;
  const maxSelectionCount = aclpAlertServiceTypeConfig.find(
    (config) => config && serviceTypeObj === config.serviceType
  )?.maxResourceSelectionCount;

  return !maxSelectionCount
    ? editSchema
    : editSchema.concat(getEntityIdWithMax(maxSelectionCount));
};

/**
 * @param maxSelectionCount The max selection count that needs to be applied for entity_id property
 * @returns The entity_ids prop with max validation based on the max selection count passed
 */
const getEntityIdWithMax = (maxSelectionCount: number) => {
  return object({
    entity_ids: array()
      .of(string().defined())
      .required()
      .max(
        maxSelectionCount,
        `The overall number of resources assigned to an alert can't exceed ${maxSelectionCount}.`
      ),
  });
};

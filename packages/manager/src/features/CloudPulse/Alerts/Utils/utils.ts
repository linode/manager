import { array, object, string } from 'yup';

import { aggregationTypeMap, metricOperatorTypeMap } from '../constants';

import type { AlertDimensionsProp } from '../AlertsDetail/DisplayAlertDetailChips';
import type { CreateAlertDefinitionForm } from '../CreateAlert/types';
import type {
  APIError,
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
import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
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
    alert_channels: alertChannels,
    description,
    entity_ids: entityIds,
    id,
    label,
    rule_criteria: ruleCriteria,
    severity,
    tags,
    trigger_conditions: triggerConditions,
  }: Alert,
  serviceType: AlertServiceType
): EditAlertPayloadWithService => {
  return {
    alertId: id,
    channel_ids: alertChannels.map((channel) => channel.id),
    description: description || undefined,
    entity_ids: entityIds,
    label,
    rule_criteria: {
      rules: ruleCriteria.rules.map((rule) => ({
        ...rule,
        dimension_filters:
          rule.dimension_filters?.map(({ label, ...filter }) => filter) ?? [],
      })),
    },
    serviceType,
    severity,
    tags,
    trigger_conditions: triggerConditions,
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
    ({
      aggregate_function: aggregateFunction,
      label,
      operator,
      threshold,
      unit,
    }) => {
      return {
        label,
        metricAggregationType: aggregationTypeMap[aggregateFunction],
        metricOperator: metricOperatorTypeMap[operator],
        threshold,
        unit,
      };
    }
  );
};

export const getValidationSchema = (
  serviceTypeObj: null | string,
  aclpAlertServiceTypeConfig: AclpAlertServiceTypeConfig[],
  baseSchema: ObjectSchema<
    CreateAlertDefinitionForm | EditAlertDefinitionPayload
  >,
  update?: boolean
): ObjectSchema<CreateAlertDefinitionForm | EditAlertDefinitionPayload> => {
  const maxSelectionCount = aclpAlertServiceTypeConfig.find(
    ({ serviceType }) => serviceTypeObj === serviceType
  )?.maxResourceSelectionCount;

  return maxSelectionCount === undefined
    ? baseSchema
    : baseSchema.concat(
        object({
          entity_ids: array()
            .of(string())
            .max(
              maxSelectionCount,
              update
                ? `Number of entities after update must not exceed ${maxSelectionCount}`
                : `Length must be 0 - ${maxSelectionCount}`
            ),
        }) as ObjectSchema<
          CreateAlertDefinitionForm | EditAlertDefinitionPayload
        >
      );
};

/**
 * Handles multiple API errors and maps them to form fields, setting form errors appropriately.
 * 
 * @param errors - List of errors returned from the API
 * @param errorFieldMap - A mapping of API error field names to form field paths. Use this to redirect API errors 
 *                        to specific form fields. For example, if the API returns an error for "user.name" but 
 *                        your form field is called "fullName", you would map "user" to "fullName".
 * @param multiLineErrorSeparator - Separator for multiple errors on fields that are rendered explicitly. Ex: @AlertListNoticeMessages component
 * @param singleLineErrorSeparator - Separator for multiple errors on fields that are rendered by the component. Ex: errorText prop in Autocomplete, TextField component
 * @param setError - React Hook Form's setError function to register errors with the form
 * 
 * @example
 * // Example usage:
 * const errors = [
 *   { field: "email", reason: "Email already exists" },
 *   { field: "password.length", reason: "Password is too short" }
 * ];
 * 
 * // Map API field names to form field paths
 * const errorFieldMap = {
 *   "email": "userEmail" as FieldPath<RegisterForm>,
 *   "password": "userPassword" as FieldPath<RegisterForm>
 * };
 * 
 * handleMultipleErrorMapper(
 *   errors,
 *   errorFieldMap,
 *   " | ", // Multiline separator
 *   " ",   // Single line separator
 *   setError
 * );
 */
export const handleMultipleErrorMapper = <T extends FieldValues>(
  errors: APIError[],
  errorFieldMap: Record<string, FieldPath<T>>,
  multiLineErrorSeparator: string,
  singleLineErrorSeparator: string,
  setError: UseFormSetError<T>
) => {
  const errorMap: Map<FieldPath<T>, string> = new Map();

  for (const error of errors) {
    if (!error.field) {
      continue;
    }

    const errorFieldParent = error.field.split('.')[0];
    const errorParent: FieldPath<T> =
      errorFieldMap[errorFieldParent] ?? error.field;

    const formattedReason = error.reason.endsWith('.')
      ? error.reason
      : `${error.reason}.`;

    const separator = errorFieldMap[errorFieldParent]
      ? multiLineErrorSeparator
      : singleLineErrorSeparator;

    if (errorMap.has(errorParent)) {
      const existingMessage = errorMap.get(errorParent)!;
      if (!existingMessage.includes(formattedReason)) {
        errorMap.set(
          errorParent,
          `${existingMessage}${separator}${formattedReason}`
        );
      }
    } else {
      errorMap.set(errorParent, formattedReason);
    }
    setError(errorParent, { message: errorMap.get(errorParent) });
  }
};

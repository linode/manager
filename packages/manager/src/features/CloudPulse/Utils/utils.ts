import { useAccount } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';

import { convertData } from 'src/features/Longview/shared/formatters';
import { useFlags } from 'src/hooks/useFlags';

import {
  INTERFACE_IDS_CONSECUTIVE_COMMAS_ERROR_MESSAGE,
  INTERFACE_IDS_ERROR_MESSAGE,
  INTERFACE_IDS_LEADING_COMMA_ERROR_MESSAGE,
  INTERFACE_IDS_LIMIT_ERROR_MESSAGE,
  PORT,
  PORTS_CONSECUTIVE_COMMAS_ERROR_MESSAGE,
  PORTS_ERROR_MESSAGE,
  PORTS_LEADING_COMMA_ERROR_MESSAGE,
  PORTS_LIMIT_ERROR_MESSAGE,
  PORTS_RANGE_ERROR_MESSAGE,
} from './constants';

import type {
  APIError,
  Dashboard,
  DimensionFilterOperatorType,
  ResourcePage,
  Service,
  ServiceTypesList,
  TimeDuration,
} from '@linode/api-v4';
import type { UseQueryResult } from '@tanstack/react-query';
import type {
  StatWithDummyPoint,
  WithStartAndEnd,
} from 'src/features/Longview/request.types';

/**
 *
 * @returns an object that contains boolean property to check whether aclp is enabled or not
 */
export const useIsACLPEnabled = (): {
  isACLPEnabled: boolean;
} => {
  const { data: account, error } = useAccount();
  const flags = useFlags();

  if (error || !flags) {
    return { isACLPEnabled: false };
  }

  const isACLPEnabled =
    (flags.aclp?.enabled && flags.aclp?.bypassAccountCapabilities) ||
    isFeatureEnabledV2(
      'Akamai Cloud Pulse',
      Boolean(flags.aclp?.enabled),
      account?.capabilities ?? []
    );

  return { isACLPEnabled };
};

/**
 *
 * @param nonFormattedString input string that is to be formatted with first letter of each word capital
 * @returns the formatted string for the @nonFormattedString
 */
export const convertStringToCamelCasesWithSpaces = (
  nonFormattedString: string
): string => {
  return nonFormattedString
    ?.split(' ')
    .map((text) => text.charAt(0).toUpperCase() + text.slice(1))
    .join(' ');
};

export const createObjectCopy = <T>(object: T): null | T => {
  if (!object) {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(object));
  } catch (e) {
    return null;
  }
};

/**
 *
 * @param timeDuration object according to which appropriate seconds values are calculated
 * @returns WithStartAndEnd object woth starting & ending second value for the @timeDuration
 */
export const convertTimeDurationToStartAndEndTimeRange = (
  timeDuration: TimeDuration
): WithStartAndEnd => {
  const nowInSeconds = Date.now() / 1000;

  const unitToSecondsMap: { [unit: string]: number } = {
    days: 86400,
    hr: 3600,
    min: 60,
  };

  const durationInSeconds =
    (unitToSecondsMap[timeDuration.unit] || 0) * timeDuration.value;

  return {
    end: nowInSeconds,
    start: nowInSeconds - durationInSeconds,
  };
};

/**
 *
 * @param data CloudPulseMetricData that has to be formatted
 * @param startTime start timestamp for the data
 * @param endTime end timestamp for the data
 * @returns formatted data based on the time range between @startTime & @endTime
 */
export const seriesDataFormatter = (
  data: [number, number][],
  startTime: number,
  endTime: number
): [number, null | number][] => {
  if (!data || data.length === 0) {
    return [];
  }

  const formattedArray: StatWithDummyPoint[] = data.map(([x, y]) => ({
    x: Number(x),
    y: y !== null ? Number(y) : null,
  }));

  return convertData(formattedArray, startTime, endTime);
};

/**
 *
 * @param rawServiceTypes list of service types returned from api response
 * @returns converted service types list into string array
 */
export const formattedServiceTypes = (
  rawServiceTypes: ServiceTypesList | undefined
): string[] => {
  if (rawServiceTypes === undefined || rawServiceTypes.data.length === 0) {
    return [];
  }
  return rawServiceTypes.data.map((obj: Service) => obj.service_type);
};

/**
 *
 * @param queryResults queryResults received from useCloudPulseDashboardsQuery
 * @param serviceTypes list of service types available
 * @returns list of dashboards for all the service types & respective loading and error states
 */
export const getAllDashboards = (
  queryResults: UseQueryResult<ResourcePage<Dashboard>, APIError[]>[],
  serviceTypes: string[]
) => {
  let error = '';
  let isLoading = false;
  const data: Dashboard[] = queryResults
    .filter((queryResult, index) => {
      if (queryResult.isError) {
        error += serviceTypes[index] + ' ,';
      }
      if (queryResult.isLoading) {
        isLoading = true;
      }
      return !queryResult.isLoading && !queryResult.isError;
    })
    .map((queryResult) => queryResult?.data?.data ?? [])
    .flat();
  return {
    data,
    error,
    isLoading,
  };
};

/**
 * @param port
 * @returns error message string
 * @description Validates a single port and returns the error message
 */
export const isValidPort = (port: string): string | undefined => {
  if (port === '') {
    return undefined;
  }

  // Check for leading zeros
  if (!port || port.startsWith('0')) {
    return PORTS_RANGE_ERROR_MESSAGE;
  }

  const convertedPort = parseInt(port, 10);
  if (!(1 <= convertedPort && convertedPort <= 65535)) {
    return PORTS_RANGE_ERROR_MESSAGE;
  }

  return undefined;
};

/**
 * @param ports
 * @returns error message string
 * @description Validates a comma-separated list of ports and sets the error message
 */
export const arePortsValid = (ports: string): string | undefined => {
  if (ports === '') {
    return undefined;
  }

  if (ports.startsWith(',')) {
    return PORTS_LEADING_COMMA_ERROR_MESSAGE;
  }

  if (ports.includes(',,')) {
    return PORTS_CONSECUTIVE_COMMAS_ERROR_MESSAGE;
  }

  if (!/^[\d,]+$/.test(ports)) {
    return PORTS_ERROR_MESSAGE;
  }

  const portList = ports.split(',');
  let portLimitCount = 0;

  for (const port of portList) {
    const result = isValidPort(port);
    if (result !== undefined) {
      return result;
    }
    portLimitCount++;
  }

  if (portLimitCount > 15) {
    return PORTS_LIMIT_ERROR_MESSAGE;
  }

  return undefined;
};

/**
 * @param interfaceIds
 * @returns error message string
 * @description Validates a comma-separated list of interface ids and sets the error message
 */
export const areValidInterfaceIds = (
  interfaceIds: string
): string | undefined => {
  if (interfaceIds === '') {
    return undefined;
  }

  if (interfaceIds.startsWith(',')) {
    return INTERFACE_IDS_LEADING_COMMA_ERROR_MESSAGE;
  }

  if (interfaceIds.includes(',,')) {
    return INTERFACE_IDS_CONSECUTIVE_COMMAS_ERROR_MESSAGE;
  }

  if (!/^[\d,]+$/.test(interfaceIds)) {
    return INTERFACE_IDS_ERROR_MESSAGE;
  }

  const interfaceIdList = interfaceIds.split(',');
  const interfaceIdLimitCount = interfaceIdList.length;

  if (interfaceIdLimitCount > 15) {
    return INTERFACE_IDS_LIMIT_ERROR_MESSAGE;
  }

  return undefined;
};

/**
 * @param filterKey
 * @returns validation function based on the filter key
 */
export const getValidationFunction = (filterKey: string) => {
  if (filterKey === PORT) {
    return arePortsValid;
  }

  return areValidInterfaceIds;
};

/**
 * @param value
 * @param setErrorText
 * @description Handles the keydown event for the port input
 */
export const handleKeyDown =
  (
    value: string,
    setErrorText: (error: string | undefined) => void,
    dimensionOperator: DimensionFilterOperatorType | undefined = undefined
  ) =>
  (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['ArrowLeft', 'ArrowRight', 'Tab', 'Control', 'Meta'];

    // Allow copy/paste/select keyboard shortcuts
    const isCtrlCmd = e.ctrlKey || e.metaKey;
    const copyPasteKeys = ['a', 'c', 'v', 'x', 'z', 'y'];
    if (
      allowedKeys.includes(e.key) ||
      (isCtrlCmd && copyPasteKeys.includes(e.key.toLowerCase()))
    ) {
      setErrorText(undefined);
      return;
    }

    const selectionStart = (e.target as HTMLInputElement).selectionStart ?? 0;
    const selectionEnd = (e.target as HTMLInputElement).selectionEnd ?? 0;
    let newValue;

    // Calculate new value based on key type
    if (e.key === 'Backspace' || e.key === 'Delete') {
      if (selectionStart > 0) {
        newValue =
          value.substring(0, selectionStart - 1) +
          value.substring(selectionStart);
      } else {
        return;
      }
    } else {
      if (/^[\d,]$/.test(e.key)) {
        newValue =
          value.substring(0, selectionStart) +
          e.key +
          value.substring(selectionEnd);
      } else {
        e.preventDefault();
        setErrorText(PORTS_ERROR_MESSAGE);
        return;
      }
    }

    if (dimensionOperator && dimensionOperator !== 'in' && e.key === ',') {
      e.preventDefault();
      setErrorText('Commas are not allowed.');
      return;
    }
    // Check if each segment (split by comma) is a valid port
    const validationError = arePortsValid(newValue);
    if (validationError !== undefined) {
      e.preventDefault();
      setErrorText(validationError);
      return;
    }

    setErrorText(validationError);
  };

/**
 * @param value
 * @param setErrorText
 * @description Handles the paste event for the port input
 */
export const handlePaste =
  (value: string, setErrorText: (error: string | undefined) => void) =>
  (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('text');
    if (!/^[\d,]+$/.test(pastedData)) {
      e.preventDefault();
      setErrorText(PORTS_ERROR_MESSAGE);
      return;
    }

    const newValue = value + pastedData; // Handle cursor position properly

    const validationError = arePortsValid(newValue);
    if (validationError !== undefined) {
      e.preventDefault();
      setErrorText(validationError);
      return;
    }

    setErrorText(undefined);
  };

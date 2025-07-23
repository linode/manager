import { useAccount, useRegionsQuery } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';
import React from 'react';

import { convertData } from 'src/features/Longview/shared/formatters';
import { useFlags } from 'src/hooks/useFlags';

import {
  PORTS_CONSECUTIVE_COMMAS_ERROR_MESSAGE,
  PORTS_ERROR_MESSAGE,
  PORTS_LEADING_COMMA_ERROR_MESSAGE,
  PORTS_LEADING_ZERO_ERROR_MESSAGE,
  PORTS_LIMIT_ERROR_MESSAGE,
  PORTS_RANGE_ERROR_MESSAGE,
} from './constants';
import { compareArrays } from './FilterBuilder';

import type {
  Alert,
  APIError,
  Capabilities,
  CloudPulseAlertsPayload,
  Dashboard,
  MonitoringCapabilities,
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

interface AclpSupportedRegionProps {
  /**
   * The capability to check ('Linodes', 'NodeBalancers', etc)
   */
  capability: Capabilities;
  /**
   * Region ID to check
   */
  regionId: string | undefined;
  /**
   * The type of monitoring capability to check
   */
  type: keyof MonitoringCapabilities;
}

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
 * @param alerts List of alerts to be displayed
 * @param entityId Id of the selected entity
 * @returns enabledAlerts, setEnabledAlerts, hasUnsavedChanges, initialState
 */
export const useContextualAlertsState = (
  alerts: Alert[],
  entityId?: string
) => {
  const calculateInitialState = React.useCallback(
    (alerts: Alert[], entityId?: string): CloudPulseAlertsPayload => {
      const initialStates: CloudPulseAlertsPayload = {
        system: [],
        user: [],
      };

      alerts.forEach((alert) => {
        const isAccountOrRegion =
          alert.scope === 'region' || alert.scope === 'account';

        // include alerts which has either account or region level scope or entityId is present in the alert's entity_ids
        const shouldInclude = entityId
          ? isAccountOrRegion || alert.entity_ids.includes(entityId)
          : isAccountOrRegion;

        if (shouldInclude) {
          initialStates[alert.type]?.push(alert.id);
        }
      });

      return initialStates;
    },
    []
  );

  const initialState = React.useMemo(
    () => calculateInitialState(alerts, entityId),
    [alerts, entityId, calculateInitialState]
  );

  const [enabledAlerts, setEnabledAlerts] = React.useState(initialState);

  // Check if the enabled alerts have changed from the initial state
  const hasUnsavedChanges = React.useMemo(() => {
    return (
      !compareArrays(enabledAlerts.system ?? [], initialState.system ?? []) ||
      !compareArrays(enabledAlerts.user ?? [], initialState.user ?? [])
    );
  }, [enabledAlerts, initialState]);

  return {
    enabledAlerts,
    setEnabledAlerts,
    hasUnsavedChanges,
    initialState,
  };
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
  if (port.startsWith('0') && port !== '0') {
    return PORTS_LEADING_ZERO_ERROR_MESSAGE;
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
 * Checks if the selected region is ACLP-supported for the given capability and type.
 * @param props Contains regionId, capability and type to check against the regions data.
 * @returns boolean indicating if the selected region is ACLP-supported for the given capability and type.
 */
export const useIsAclpSupportedRegion = (
  props: AclpSupportedRegionProps
): boolean => {
  const { regionId, capability, type } = props;

  const { data: regions } = useRegionsQuery();

  const region = regions?.find(({ id }) => id === regionId);

  return region?.monitors?.[type]?.includes(capability) ?? false;
};

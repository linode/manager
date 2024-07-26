import { props } from 'ramda';

import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account/account';

import { FILTER_CONFIG } from './FilterConfig';

import type { CloudPulseServiceTypeFilters } from './models';
import type { Dashboard, TimeDuration } from '@linode/api-v4';

export const useIsACLPEnabled = (): {
  isACLPEnabled: boolean;
} => {
  const { data: account, error } = useAccount();
  const flags = useFlags();

  if (error || !flags) {
    return { isACLPEnabled: false };
  }

  const hasAccountCapability = account?.capabilities?.includes('CloudPulse');
  const isFeatureFlagEnabled = flags.aclp?.enabled;

  const isACLPEnabled = Boolean(hasAccountCapability && isFeatureFlagEnabled);

  return { isACLPEnabled };
};

export const convertStringToCamelCasesWithSpaces = (
  nonFormattedString: string
): string => {
  return nonFormattedString
    ?.split(' ')
    .map((text) => text.charAt(0).toUpperCase() + text.slice(1))
    .join(' ');
};

export const createObjectCopy = <T>(object: T): T | null => {
  if (!object) {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(object));
  } catch (e) {
    return null;
  }
};

export const getRegionProperties = (
  config: CloudPulseServiceTypeFilters,
  handleRegionChange: (region: string | undefined) => void,
  dashboard: Dashboard,
  isServiceAnalyticsIntegration: boolean
) => {
  return {
    componentKey: config.configuration.filterKey,
    filterKey: config.configuration.filterKey,
    handleRegionChange,
    key: config.configuration.filterKey,
    placeholder: config.configuration.placeholder,
    savePreferences: !isServiceAnalyticsIntegration,
    selectedDashboard: dashboard,
  };
};

export const getResourcesProperties = (
  config: CloudPulseServiceTypeFilters,
  handleResourceChange: (resourceId: number[]) => void,
  dashboard: Dashboard,
  isServiceAnalyticsIntegration: boolean,
  dependentFilters: { [key: string]: any }
) => {
  return {
    componentKey: config.configuration.filterKey,
    disabled: checkIfWeNeedToDisableFilterByFilterKey(
      config.configuration.filterKey,
      dependentFilters,
      dashboard
    ),
    filterKey: config.configuration.filterKey,
    handleResourcesSelection: handleResourceChange,
    key: config.configuration.filterKey,
    placeholder: config.configuration.placeholder,
    resourceType: dashboard.service_type,
    savePreferences: !isServiceAnalyticsIntegration,
    xFilter: buildXFilter(config, dependentFilters),
  };
};

export const getTimeDurationProperties = (
  config: CloudPulseServiceTypeFilters,
  handleTimeRangeChange: (timeDuration: TimeDuration) => void,
  isServiceAnalyticsIntegration: boolean
) => {
  return {
    componentKey: config.configuration.filterKey,
    filterKey: config.configuration.filterKey,
    handleStatsChange: handleTimeRangeChange,
    key: config.configuration.filterKey,
    placeholder: config.configuration.placeholder,
    savePreferences: !isServiceAnalyticsIntegration,
  };
};

export const buildXFilter = (
  config: CloudPulseServiceTypeFilters,
  dependentFilters: { [key: string]: any }
) => {
  const xFilterObj: any = {};

  if (config.configuration.dependency) {
    for (let i = 0; i < config.configuration.dependency.length; i++) {
      xFilterObj[config.configuration.dependency[i]] =
        dependentFilters[config.configuration.dependency[i]];
    }
  }

  return xFilterObj;
};

export const checkIfWeNeedToDisableFilterByFilterKey = (
  filterKey: string,
  dependentFilters: { [key: string]: any },
  dashboard: Dashboard
) => {
  if (dashboard && dashboard.service_type) {
    const serviceTypeConfig = FILTER_CONFIG.get(dashboard.service_type!);
    const filters = serviceTypeConfig?.filters ?? [];

    for (const filter of filters) {
      if (
        filter?.configuration.filterKey === filterKey &&
        filter.configuration.dependency
      ) {
        return filter.configuration.dependency.some((dependent) => {
          const dependentFilter = dependentFilters[dependent];
          return (
            !dependentFilter ||
            (Array.isArray(dependentFilter) && dependentFilter.length === 0)
          );
        });
      }
    }
  }
  return false;
};

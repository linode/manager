import React from 'react';

import { FILTER_CONFIG } from '../Utils/FilterConfig';
import { CloudPulseAppliedFilter } from './CloudPulseAppliedFilter';

import type { CloudPulseAppliedFilterProps } from './CloudPulseAppliedFilter';

interface AppliedFilterRendererProps extends CloudPulseAppliedFilterProps {
  dashboardId: number;
}

export const CloudPulseAppliedFilterRenderer = (
  props: AppliedFilterRendererProps
) => {
  const { filters, dashboardId } = props;

  const filterConfig = FILTER_CONFIG.get(dashboardId);

  if (!filterConfig) {
    return <></>;
  }
  const configuredFilters = filterConfig.filters;

  const appliedFilter = configuredFilters
    .filter((filter) => {
      const filterKey = filter.configuration.filterKey;
      return Boolean(filters[filterKey]?.length);
    })
    .reduce(
      (prevValue, filter) => ({
        ...prevValue,
        [filter.configuration.name]: filters[filter.configuration.filterKey],
      }),
      {}
    );

  return <CloudPulseAppliedFilter filters={appliedFilter} />;
};

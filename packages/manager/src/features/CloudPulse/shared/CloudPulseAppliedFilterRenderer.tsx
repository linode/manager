import React from 'react';

import { FILTER_CONFIG } from '../Utils/FilterConfig';
import { CloudPulseAppliedFilter } from './CloudPulseAppliedFilter';

interface AppliedFilterRendererProps {
  filters: {
    [label: string]: string[];
  };
  serviceType: string;
}

export const CloudPulseAppliedFilterRenderer = (
  props: AppliedFilterRendererProps
) => {
  const { filters, serviceType } = props;

  const filterConfig = FILTER_CONFIG.get(serviceType);

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

import { Grid } from '@mui/material';
import React from 'react';

import NullComponent from 'src/components/NullComponent';

import { serviceToFiltersMap } from './constants';

import type { AlertFilterType } from './types';

interface AlertResourceFiltersProps {
  /**
   * Callback to publish the selected filter with filter key
   */
  handleFilterChange: (value: AlertFilterType, filterKey: string) => void;
  /**
   * The service type associated with alerts like linode, dbaas etc.,
   */
  serviceType?: string;
}

/**
 * Dynamically renders filters based on serviceType using serviceFiltersMap.
 * Improves readability and reusability.
 */
export const AlertResourceAdditionalFilters = ({
  handleFilterChange,
  serviceType,
}: AlertResourceFiltersProps) => {
  const filtersToRender = serviceToFiltersMap[serviceType ?? ''] ?? [];

  if (!filtersToRender.length) {
    return <NullComponent />;
  }

  return (
    <>
      {filtersToRender.map((filterComponent, index) => (
        <Grid item key={index} md={4} xs={12}>
          {React.createElement(filterComponent, { handleFilterChange })}
        </Grid>
      ))}
    </>
  );
};

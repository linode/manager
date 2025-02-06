import { Grid } from '@mui/material';
import React from 'react';

import NullComponent from 'src/components/NullComponent';

import { serviceFiltersMap } from './constants';

import type { AlertFilterType } from './constants';

interface AlertResourceFiltersProps {
  handleFilterChange: (value: AlertFilterType, filterKey: string) => void;
  serviceType?: string;
}

/**
 * Dynamically renders filters based on serviceType using serviceFiltersMap.
 * Improves readability and reusability.
 */
export const AlertResourceAdditionalFilters: React.FC<AlertResourceFiltersProps> = ({
  handleFilterChange,
  serviceType,
}: AlertResourceFiltersProps) => {
  const filtersToRender = serviceFiltersMap[serviceType ?? ''] ?? [];

  if (!filtersToRender.length) {
    return <NullComponent />;
  }

  return (
    <>
      {filtersToRender.map((FilterComponent, index) => (
        <Grid item key={index} md={4} xs={12}>
          <FilterComponent handleSelection={handleFilterChange} />
        </Grid>
      ))}
    </>
  );
};

import { CircleProgress, Typography } from '@linode/ui';
import { Grid, useTheme } from '@mui/material';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import { useRegionsQuery } from 'src/queries/regions/regions';

import {
  getRegionOptions,
  getRegionsIdLabelMap,
} from '../Utils/AlertResourceUtils';
import { AlertsRegionFilter } from './AlertsRegionFilter';

import type { Region } from '@linode/api-v4';

export interface AlertResourcesProp {
  /**
   * The label of the alert to be displayed
   */
  alertLabel?: string;

  /**
   * The set of resource ids associated with the alerts, that needs to be displayed
   */
  resourceIds: string[];

  /**
   * The service type associated with the alerts like DBaaS, Linode etc.,
   */
  serviceType: string;
}

export const AlertResources = React.memo((props: AlertResourcesProp) => {
  const { alertLabel, resourceIds, serviceType } = props;
  const [searchText, setSearchText] = React.useState<string>();

  const [, setFilteredRegions] = React.useState<string[]>();

  const theme = useTheme();

  const {
    data: regions,
    isError: isRegionsError,
    isFetching: isRegionsFetching,
  } = useRegionsQuery();

  const {
    data: resources,
    isError: isResourcesError,
    isFetching: isResourcesFetching,
  } = useResourcesQuery(
    Boolean(serviceType),
    serviceType,
    {},
    serviceType === 'dbaas' ? { platform: 'rdbms-default' } : {}
  );

  // The map holds the id of the region to the entire region object that needs to be displayed in table
  const regionsIdToLabelMap: Map<string, Region> = React.useMemo(() => {
    return getRegionsIdLabelMap(regions);
  }, [regions]);

  /**
   * Holds the regions associated with the resources from list of regions
   */
  const regionOptions: Region[] = React.useMemo(() => {
    return getRegionOptions({
      data: resources,
      regionsIdToLabelMap,
      resourceIds,
    });
  }, [resources, resourceIds, regionsIdToLabelMap]);

  const titleRef = React.useRef<HTMLDivElement>(null); // when the page size, page number of table changes lets scroll until the title of this component

  if (isResourcesFetching || isRegionsFetching) {
    return <CircleProgress />;
  }

  if (isResourcesError || isRegionsError) {
    return (
      <ErrorState errorText="An error occurred while loading the resources associated with the alert. Please try again later." />
    );
  }

  return (
    <>
      <Typography marginBottom={2} ref={titleRef} variant="h2">
        {alertLabel ?? 'Resources'}
      </Typography>
      <Grid container spacing={3}>
        <Grid columnSpacing={1} container item rowSpacing={3} xs={12}>
          <Grid item md={3} xs={12}>
            <DebouncedSearchTextField
              onSearch={(value) => {
                setSearchText(value);
              }}
              sx={{
                maxHeight: theme.spacing(4.25),
              }}
              clearable
              debounceTime={300}
              hideLabel
              isSearching={false}
              label="Search for a Resource"
              placeholder="Search for a Resource"
              value={searchText ?? ''}
            />
          </Grid>
          <Grid item md={4} xs={12}>
            <AlertsRegionFilter
              handleSelectionChange={(value) => {
                setFilteredRegions(value);
              }}
              regionOptions={regionOptions ?? []}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
});

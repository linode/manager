import { CircleProgress, Stack, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import { useRegionsQuery } from 'src/queries/regions/regions';

import {
  getRegionOptions,
  getRegionsIdLabelMap,
} from '../Utils/AlertResourceUtils';
import { AlertsRegionFilter } from './AlertsRegionFilter';
import { DisplayAlertResources } from './DisplayAlertResources';

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
   * Holds the regions associated with the resources and it is derived from the list of regions returned
   */
  const regionOptions: Region[] = React.useMemo(() => {
    return getRegionOptions({
      data: resources,
      regionsIdToLabelMap,
      resourceIds,
    });
  }, [resources, resourceIds, regionsIdToLabelMap]);

  const titleRef = React.useRef<HTMLDivElement>(null); // Its useful, when the page size, page number of table changes lets scroll until the title of this component instead of moving to top of page

  if (isResourcesFetching || isRegionsFetching) {
    return <CircleProgress />;
  }

  const isDataLoadingError = isRegionsError || isResourcesError;

  return (
    <Stack gap={2}>
      <Typography ref={titleRef} variant="h2">
        {alertLabel || 'Resources'}
        {/* It can be either the passed alert label or just Resources */}
      </Typography>

      <Grid container spacing={3}>
        <Grid columnSpacing={1} container item rowSpacing={3} xs={12}>
          <Grid item md={3} xs={12}>
            <DebouncedSearchTextField
              onSearch={(value) => {
                setSearchText(value);
              }}
              sx={{
                maxHeight: '34px',
              }}
              clearable
              hideLabel
              isSearching={false}
              label="Search for a Region or Resource"
              placeholder="Search for a Region or Resource"
              value={searchText || ''}
            />
          </Grid>
          <Grid item md={4} xs={12}>
            <AlertsRegionFilter
              handleSelectionChange={(value) => {
                setFilteredRegions(value);
              }}
              regionOptions={regionOptions}
            />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <DisplayAlertResources
            errorText={
              isRegionsError || isResourcesError
                ? 'Table data is unavailable. Please try again later.'
                : undefined
            }
            isDataLoadingError={isDataLoadingError}
          />
        </Grid>
      </Grid>
    </Stack>
  );
});

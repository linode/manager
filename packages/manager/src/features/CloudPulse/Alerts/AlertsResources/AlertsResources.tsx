import { CircleProgress, Stack, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';

import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import NullComponent from 'src/components/NullComponent';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { StyledPlaceholder } from '../AlertsDetail/AlertDetail';
import {
  getFilteredResources,
  getRegionOptions,
  getRegionsIdRegionMap,
  scrollToTitle,
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
  alertResourceIds: string[];

  /**
   * The service type associated with the alerts like DBaaS, Linode etc.,
   */
  serviceType: string;
}

export const AlertResources = React.memo((props: AlertResourcesProp) => {
  const { alertLabel, alertResourceIds, serviceType } = props;
  const [searchText, setSearchText] = React.useState<string>();
  const [filteredRegions, setFilteredRegions] = React.useState<string[]>();

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

  // A map linking region IDs to their corresponding region objects, used for quick lookup when displaying data in the table.
  const regionsIdToRegionMap: Map<string, Region> = React.useMemo(() => {
    return getRegionsIdRegionMap(regions);
  }, [regions]);

  // Derived list of regions associated with the provided resource IDs, filtered based on available data.
  const regionOptions: Region[] = React.useMemo(() => {
    return getRegionOptions({
      data: resources,
      regionsIdToRegionMap,
      resourceIds: alertResourceIds,
    });
  }, [resources, alertResourceIds, regionsIdToRegionMap]);

  const isDataLoadingError = isRegionsError || isResourcesError;

  // Memoized no resource message
  const renderNoResourcesMessage = React.useMemo(() => {
    if (!isDataLoadingError && alertResourceIds.length === 0) {
      return (
        <StyledPlaceholder
          title={
            'No resources are currently assigned to this alert definition.'
          }
          icon={EntityIcon}
          subtitle="You can assign alerts during the resource creation process."
        />
      );
    }
    return <NullComponent />;
  }, [alertResourceIds, isDataLoadingError]);

  const handleSearchTextChange = (searchText: string) => {
    setSearchText(searchText);
  };

  const handleFilteredRegionsChange = (selectedRegions: string[]) => {
    setFilteredRegions(
      selectedRegions.map(
        (region) => `${regionsIdToRegionMap.get(region)?.label} (${region})` // store filtered regions in format `region.label (region.id)`
      )
    );
  };

  /**
   * Holds the resources that are
   * filtered based on the passed resourceIds, typed searchText and filtered regions
   */
  const filteredResources = React.useMemo(() => {
    return getFilteredResources({
      data: resources,
      filteredRegions,
      regionsIdToRegionMap,
      resourceIds: alertResourceIds,
      searchText,
    });
  }, [
    resources,
    alertResourceIds,
    searchText,
    filteredRegions,
    regionsIdToRegionMap,
  ]);

  const titleRef = React.useRef<HTMLDivElement>(null); // Reference to the component title, used for scrolling to the title when the table's page size or page number changes.

  if (isResourcesFetching || isRegionsFetching) {
    return <CircleProgress />;
  }

  return (
    <Stack gap={2}>
      <Typography ref={titleRef} variant="h2">
        {alertLabel || 'Resources'}
        {/* It can be either the passed alert label or just Resources */}
      </Typography>
      {/** Render the no resource state if alert has zero resources associated*/}
      {renderNoResourcesMessage}
      {(isDataLoadingError || alertResourceIds.length) && ( // if there is data loading error display error message with empty table setup
        <Grid container spacing={3}>
          <Grid columnSpacing={1} container item rowSpacing={3} xs={12}>
            <Grid item md={3} xs={12}>
              <DebouncedSearchTextField
                sx={{
                  maxHeight: '34px',
                }}
                clearable
                hideLabel
                label="Search for a Region or Resource"
                onSearch={handleSearchTextChange}
                placeholder="Search for a Region or Resource"
                value={searchText || ''}
              />
            </Grid>
            <Grid item md={4} xs={12}>
              <AlertsRegionFilter
                handleSelectionChange={handleFilteredRegionsChange}
                regionOptions={regionOptions}
              />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <DisplayAlertResources
              filteredResources={filteredResources}
              isDataLoadingError={isDataLoadingError}
              pageSize={25}
              scrollToTitle={() => scrollToTitle(titleRef.current)}
            />
          </Grid>
        </Grid>
      )}
    </Stack>
  );
});

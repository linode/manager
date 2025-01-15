import { CircleProgress, Typography } from '@linode/ui';
import { Grid, useTheme } from '@mui/material';
import React from 'react';

import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { StyledPlaceholder } from '../AlertsDetail/AlertDetail';
import {
  getFilteredResources,
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
   * Callback for publishing the selected resources
   */
  handleResourcesSelection?: (resources: string[]) => void;

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
  const {
    alertLabel,
    handleResourcesSelection,
    resourceIds,
    serviceType,
  } = props;

  const [searchText, setSearchText] = React.useState<string>();

  const [filteredRegions, setFilteredRegions] = React.useState<string[]>();

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

  /**
   * Holds the resources that are
   * filtered based on the passed resourceIds, typed searchText and filtered regions
   */
  const filteredResources = React.useMemo(() => {
    return getFilteredResources({
      data: resources,
      filteredRegions,
      regionsIdToLabelMap,
      resourceIds,
      searchText,
    });
  }, [
    resources,
    resourceIds,
    searchText,
    filteredRegions,
    regionsIdToLabelMap,
  ]);

  const titleRef = React.useRef<HTMLDivElement>(null); // when the page size, page number of table changes lets scroll until the title of this component

  const scrollToTitle = () => {
    if (titleRef.current) {
      window.scrollTo({
        behavior: 'smooth',
        top: titleRef.current.getBoundingClientRect().top + window.scrollY - 40, // Adjust offset if needed
      });
    }
  };

  if (isResourcesFetching || isRegionsFetching) {
    return <CircleProgress />;
  }

  return (
    <>
      <Typography marginBottom={2} ref={titleRef} variant="h2">
        {alertLabel ?? 'Resources'}
      </Typography>

      {!isResourcesError && !isRegionsError && resourceIds.length === 0 && (
        <StyledPlaceholder
          title={
            'No resources are currently assigned to this alert definition.'
          }
          icon={EntityIcon}
          subtitle="You can assign alerts during the resource creation process."
        />
      )}

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
              label="Search for a Region or Resource"
              placeholder="Search for a Region or Resource"
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
        <Grid item xs={12}>
          <DisplayAlertResources
            errorText={
              isRegionsError || isResourcesError
                ? 'Table data is unavailable. Please try again later.'
                : undefined
            }
            filteredResources={filteredResources}
            isDataLoadingError={isRegionsError || isResourcesError}
            pageSize={25}
            scrollToTitle={scrollToTitle}
          />
        </Grid>
      </Grid>
    </>
  );
});

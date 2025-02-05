import { CircleProgress, Stack, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';

import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { StyledPlaceholder } from '../AlertsDetail/AlertDetail';
import {
  getFilteredResources,
  getRegionOptions,
  getRegionsIdRegionMap,
  scrollToElement,
} from '../Utils/AlertResourceUtils';
import { AlertsRegionFilter } from './AlertsRegionFilter';
import { DisplayAlertResources } from './DisplayAlertResources';

import type { AlertInstance } from './DisplayAlertResources';
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
   * Callback for publishing the selected resources
   */
  handleResourcesSelection?: (resources: string[]) => void;

  /**
   * This controls whether we need to show the checkbox in case of editing the resources
   */
  isSelectionsNeeded?: boolean;

  /**
   * The service type associated with the alerts like DBaaS, Linode etc.,
   */
  serviceType: string;
}

export const AlertResources = React.memo((props: AlertResourcesProp) => {
  const {
    alertLabel,
    alertResourceIds,
    handleResourcesSelection,
    isSelectionsNeeded,
    serviceType,
  } = props;
  const [searchText, setSearchText] = React.useState<string>();
  const [filteredRegions, setFilteredRegions] = React.useState<string[]>();
  const [selectedResources, setSelectedResources] = React.useState<string[]>(
    alertResourceIds
  );

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

  const computedSelectedResources = React.useMemo(() => {
    if (!isSelectionsNeeded || !resources) {
      return alertResourceIds;
    }
    return resources
      .filter(({ id }) => alertResourceIds.includes(id))
      .map(({ id }) => id);
  }, [resources, isSelectionsNeeded, alertResourceIds]);

  React.useEffect(() => {
    setSelectedResources(computedSelectedResources);
  }, [computedSelectedResources]);

  // A map linking region IDs to their corresponding region objects, used for quick lookup when displaying data in the table.
  const regionsIdToRegionMap: Map<string, Region> = React.useMemo(() => {
    return getRegionsIdRegionMap(regions);
  }, [regions]);

  // Derived list of regions associated with the provided resource IDs, filtered based on available data.
  const regionOptions: Region[] = React.useMemo(() => {
    return getRegionOptions({
      data: resources,
      isAdditionOrDeletionNeeded: isSelectionsNeeded,
      regionsIdToRegionMap,
      resourceIds: alertResourceIds,
    });
  }, [resources, alertResourceIds, regionsIdToRegionMap, isSelectionsNeeded]);

  const isDataLoadingError = isRegionsError || isResourcesError;

  const handleSearchTextChange = (searchText: string) => {
    setSearchText(searchText);
  };

  const handleFilteredRegionsChange = (selectedRegions: string[]) => {
    setFilteredRegions(
      selectedRegions.map(
        (region) =>
          regionsIdToRegionMap.get(region)
            ? `${regionsIdToRegionMap.get(region)?.label} (${region})`
            : region // Stores filtered regions in the format `region.label (region.id)` that is displayed and filtered in the table
      )
    );
  };

  /**
   * Filters resources based on the provided resource IDs, search text, and filtered regions.
   */
  const filteredResources: AlertInstance[] = React.useMemo(() => {
    return getFilteredResources({
      data: resources,
      filteredRegions,
      isAdditionOrDeletionNeeded: isSelectionsNeeded,
      regionsIdToRegionMap,
      resourceIds: alertResourceIds,
      searchText,
      selectedResources,
    });
  }, [
    resources,
    filteredRegions,
    isSelectionsNeeded,
    regionsIdToRegionMap,
    alertResourceIds,
    searchText,
    selectedResources,
  ]);

  const handleSelection = React.useCallback(
    (ids: string[], isSelectionAction: boolean) => {
      setSelectedResources((prevSelected) => {
        const updatedSelection = isSelectionAction
          ? [...prevSelected, ...ids.filter((id) => !prevSelected.includes(id))]
          : prevSelected.filter((resource) => !ids.includes(resource));

        handleResourcesSelection?.(updatedSelection);
        return updatedSelection;
      });
    },
    [handleResourcesSelection]
  );

  const titleRef = React.useRef<HTMLDivElement>(null); // Reference to the component title, used for scrolling to the title when the table's page size or page number changes.
  const isNoResources =
    !isDataLoadingError && !isSelectionsNeeded && alertResourceIds.length === 0;

  if (isResourcesFetching || isRegionsFetching) {
    return <CircleProgress />;
  }

  if (isNoResources) {
    return (
      <Stack gap={2}>
        <Typography ref={titleRef} variant="h2">
          {alertLabel || 'Resources'}
          {/* It can be either the passed alert label or just Resources */}
        </Typography>
        <StyledPlaceholder
          icon={EntityIcon}
          subtitle="You can assign alerts during the resource creation process."
          title="No resources are currently assigned to this alert definition."
        />
      </Stack>
    );
  }

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
            handleSelection={handleSelection}
            isDataLoadingError={isDataLoadingError}
            isSelectionsNeeded={isSelectionsNeeded}
            scrollToElement={() => scrollToElement(titleRef.current)}
          />
        </Grid>
      </Grid>
    </Stack>
  );
});

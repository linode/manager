import { Checkbox, CircleProgress, Stack, Typography } from '@linode/ui';
import { Grid, useTheme } from '@mui/material';
import React from 'react';

import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { StyledPlaceholder } from '../AlertsDetail/AlertDetail';
import {
  getFilterProps,
  getFilteredResources,
  getRegionOptions,
  getRegionsIdRegionMap,
  scrollToElement,
} from '../Utils/AlertResourceUtils';
import { buildFilterComponent } from './AlertsResourcesFilterRenderer';
import { AlertsResourcesNotice } from './AlertsResourcesNotice';
import { serviceToFiltersMap } from './constants';
import { DisplayAlertResources } from './DisplayAlertResources';

import type { AlertInstance } from './DisplayAlertResources';
import type { AlertAdditionalFilterKey, AlertFilterType } from './types';
import type {
  AlertDefinitionType,
  AlertServiceType,
  Region,
} from '@linode/api-v4';

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
   * The type of the alert system | user
   */
  alertType: AlertDefinitionType;

  /**
   * Callback for publishing the selected resources
   */
  handleResourcesSelection?: (resources: string[]) => void;

  /**
   * Property to control the visibility of the title
   */
  hideLabel?: boolean;

  /**
   * This controls whether we need to show the checkbox in case of editing the resources
   */
  isSelectionsNeeded?: boolean;

  /**
   * The error text that needs to be displayed when no selections are made
   */
  noSelectionErrorText?: string;

  /**
   * The service type associated with the alerts like DBaaS, Linode etc.,
   */
  serviceType?: AlertServiceType;
}

export type SelectUnselectAll = 'Select All' | 'Unselect All';

export const AlertResources = React.memo((props: AlertResourcesProp) => {
  const {
    alertLabel,
    alertResourceIds,
    alertType,
    handleResourcesSelection,
    hideLabel,
    isSelectionsNeeded,
    noSelectionErrorText,
    serviceType,
  } = props;
  const [searchText, setSearchText] = React.useState<string>();
  const [filteredRegions, setFilteredRegions] = React.useState<string[]>();
  const [selectedResources, setSelectedResources] = React.useState<string[]>(
    alertResourceIds
  );
  const [additionalFilters, setAdditionalFilters] = React.useState<
    Record<AlertAdditionalFilterKey, AlertFilterType>
  >({ engineType: undefined });

  const [selectedOnly, setSelectedOnly] = React.useState<boolean>(false);

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

  const theme = useTheme();

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

  const handleFilterChange = (
    value: AlertFilterType,
    filterKey: AlertAdditionalFilterKey
  ) => {
    setAdditionalFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };
  /**
   * Filters resources based on the provided resource IDs, search text, and filtered regions.
   */
  const filteredResources: AlertInstance[] = React.useMemo(() => {
    return getFilteredResources({
      additionalFilters,
      data: resources,
      filteredRegions,
      isAdditionOrDeletionNeeded: isSelectionsNeeded,
      regionsIdToRegionMap,
      resourceIds: alertResourceIds,
      searchText,
      selectedOnly,
      selectedResources,
    });
  }, [
    resources,
    filteredRegions,
    isSelectionsNeeded,
    regionsIdToRegionMap,
    alertResourceIds,
    searchText,
    selectedOnly,
    selectedResources,
    additionalFilters,
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

  const handleAllSelection = React.useCallback(
    (action: SelectUnselectAll) => {
      if (!resources) {
        return;
      }

      let currentSelections: string[] = [];

      if (action === 'Unselect All') {
        // Unselect all
        setSelectedResources([]);
      } else {
        // Select all
        currentSelections = resources.map(({ id }) => id);
        setSelectedResources(currentSelections);
      }

      if (handleResourcesSelection) {
        handleResourcesSelection(currentSelections); // publish the resources selected
      }
    },
    [handleResourcesSelection, resources]
  );

  const titleRef = React.useRef<HTMLDivElement>(null); // Reference to the component title, used for scrolling to the title when the table's page size or page number changes.
  const isNoResources =
    !isDataLoadingError && !isSelectionsNeeded && alertResourceIds.length === 0;
  const showEditInformation = isSelectionsNeeded && alertType === 'system';

  if (isResourcesFetching || isRegionsFetching) {
    return <CircleProgress />;
  }

  if (isNoResources) {
    return (
      <Stack gap={2}>
        {!hideLabel && (
          <Typography ref={titleRef} variant="h2">
            {alertLabel || 'Resources'}
            {/* It can be either the passed alert label or just Resources */}
          </Typography>
        )}
        <StyledPlaceholder
          icon={EntityIcon}
          subtitle="You can assign alerts during the resource creation process."
          title="No resources are currently assigned to this alert definition."
        />
      </Stack>
    );
  }

  const filtersToRender = serviceToFiltersMap[serviceType ?? ''];

  return (
    <Stack gap={2}>
      {!hideLabel && (
        <Typography ref={titleRef} variant="h2">
          {alertLabel || 'Resources'}
          {/* It can be either the passed alert label or just Resources */}
        </Typography>
      )}
      {showEditInformation && (
        <Typography ref={titleRef} variant="body1">
          You can enable or disable this system alert for each resource you have
          access to. Select the resources listed below you want to enable the
          alert for.
        </Typography>
      )}
      <Grid container spacing={3}>
        <Grid
          alignItems="center"
          columnSpacing={2}
          container
          item
          rowSpacing={3}
          xs={12}
        >
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
          {filtersToRender.map(({ component, filter }, index) => (
            <Grid item key={`${index}_${filter}`} md={4} xs={12}>
              {buildFilterComponent({
                component,
                componentProps: getFilterProps({
                  filterKey: filter,
                  handleFilterChange,
                  handleFilteredRegionsChange,
                  regionOptions,
                }),
              })}
            </Grid>
          ))}
          {isSelectionsNeeded && (
            <Grid item md={4} xs={12}>
              <Checkbox
                sx={(theme) => ({
                  svg: {
                    backgroundColor: theme.tokens.color.Neutrals.White,
                  },
                })}
                data-testid="show_selected_only"
                disabled={!(selectedResources.length || selectedOnly)}
                onClick={() => setSelectedOnly(!selectedOnly)}
                text="Show Selected Only"
                value="Show Selected"
              />
            </Grid>
          )}
        </Grid>
        {noSelectionErrorText && (
          <Grid item xs={12}>
            <Typography
              color={theme.tokens.content.Text.Negative}
              variant="body2"
            >
              {noSelectionErrorText}
            </Typography>
          </Grid>
        )}
        {isSelectionsNeeded && !isDataLoadingError && (
          <Grid item xs={12}>
            <AlertsResourcesNotice
              handleSelectionChange={handleAllSelection}
              selectedResources={selectedResources.length}
              totalResources={resources?.length ?? 0}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <DisplayAlertResources
            filteredResources={filteredResources}
            handleSelection={handleSelection}
            isDataLoadingError={isDataLoadingError}
            isSelectionsNeeded={isSelectionsNeeded}
            scrollToElement={() => scrollToElement(titleRef.current)}
            serviceType={serviceType}
          />
        </Grid>
      </Grid>
    </Stack>
  );
});

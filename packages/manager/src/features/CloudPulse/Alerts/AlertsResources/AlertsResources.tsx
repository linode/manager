import { useRegionsQuery } from '@linode/queries';
import { Checkbox, CircleProgress, Stack, Typography } from '@linode/ui';
import { Grid, useTheme } from '@mui/material';
import React from 'react';

import EntityIcon from 'src/assets/icons/entityIcons/alertsresources.svg';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useFlags } from 'src/hooks/useFlags';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { StyledPlaceholder } from '../AlertsDetail/AlertDetail';
import { MULTILINE_ERROR_SEPARATOR } from '../constants';
import { AlertListNoticeMessages } from '../Utils/AlertListNoticeMessages';
import {
  getAlertResourceFilterProps,
  getFilteredResources,
  getRegionOptions,
  getRegionsIdRegionMap,
  getSupportedRegionIds,
  scrollToElement,
} from '../Utils/AlertResourceUtils';
import { AlertResourcesFilterRenderer } from './AlertsResourcesFilterRenderer';
import { AlertsResourcesNotice } from './AlertsResourcesNotice';
import { databaseTypeClassMap, serviceToFiltersMap } from './constants';
import { DisplayAlertResources } from './DisplayAlertResources';

import type { AlertInstance } from './DisplayAlertResources';
import type {
  AlertAdditionalFilterKey,
  AlertFilterKey,
  AlertFilterType,
} from './types';
import type {
  AlertClass,
  AlertDefinitionType,
  AlertServiceType,
  Filter,
  Region,
} from '@linode/api-v4';

export interface AlertResourcesProp {
  /**
   * Class of the alert (dedicated / shared)
   */
  alertClass?: AlertClass;
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
   * The error text that needs to displayed incase needed
   */
  errorText?: string;

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
   * The maximum number of elements that can be selected
   */
  maxSelectionCount?: number;

  /**
   * The element until which we need to scroll on pagination and order change
   */
  scrollElement?: HTMLDivElement | null;

  /**
   * The service type associated with the alerts like DBaaS, Linode etc.,
   */
  serviceType?: AlertServiceType;
}

export type SelectDeselectAll = 'Deselect All' | 'Select All';

export const AlertResources = React.memo((props: AlertResourcesProp) => {
  const {
    alertClass,
    alertLabel,
    alertResourceIds,
    alertType,
    errorText,
    handleResourcesSelection,
    hideLabel,
    isSelectionsNeeded,
    maxSelectionCount,
    scrollElement,
    serviceType,
  } = props;
  const [searchText, setSearchText] = React.useState<string>();
  const [filteredRegions, setFilteredRegions] = React.useState<string[]>();
  const [selectedResources, setSelectedResources] = React.useState<string[]>(
    alertResourceIds
  );
  const [selectedOnly, setSelectedOnly] = React.useState<boolean>(false);
  const [additionalFilters, setAdditionalFilters] = React.useState<
    Record<AlertAdditionalFilterKey, AlertFilterType>
  >({ engineType: undefined, tags: undefined });

  const {
    data: regions,
    isError: isRegionsError,
    isLoading: isRegionsLoading,
  } = useRegionsQuery();

  const flags = useFlags();
  const theme = useTheme();

  // Validate launchDarkly region ids with the ids from regionOptions prop
  const supportedRegionIds = getSupportedRegionIds(
    flags.aclpResourceTypeMap,
    serviceType
  );
  const xFilterToBeApplied: Filter | undefined = React.useMemo(() => {
    const regionFilter: Filter = supportedRegionIds
      ? {
          '+or': supportedRegionIds.map((regionId) => ({
            region: regionId,
          })),
        }
      : {};

    // if service type is other than dbaas, return only region filter
    if (serviceType !== 'dbaas') {
      return regionFilter;
    }

    // Always include platform filter for 'dbaas'
    const platformFilter: Filter = { platform: 'rdbms-default' };

    // If alertType is not 'system' or alertClass is not defined, return only platform filter
    if (alertType !== 'system' || !alertClass) {
      return platformFilter;
    }

    // Dynamically exclude 'dedicated' if alertClass is 'shared'
    const filteredTypes =
      alertClass === 'shared'
        ? Object.keys(databaseTypeClassMap).filter(
            (type) => type !== 'dedicated'
          )
        : [alertClass];

    // Apply type filter only for DBaaS user alerts with a valid alertClass based on above filtered types
    const typeFilter: Filter = {
      '+or': filteredTypes.map((dbType) => ({
        type: {
          '+contains': dbType,
        },
      })),
    };

    // Combine all the filters
    return { ...platformFilter, '+and': [typeFilter, regionFilter] };
  }, [alertClass, alertType, serviceType, supportedRegionIds]);

  const {
    data: resources,
    isError: isResourcesError,
    isLoading: isResourcesLoading,
  } = useResourcesQuery(
    Boolean(serviceType),
    serviceType,
    {},
    xFilterToBeApplied
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

  const handleFilterChange = React.useCallback(
    (value: AlertFilterType, filterKey: AlertFilterKey) => {
      setAdditionalFilters((prev) => ({ ...prev, [filterKey]: value }));
    },
    []
  );

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
    (action: SelectDeselectAll) => {
      if (!resources) {
        return;
      }

      let currentSelections: string[] = [];

      if (action === 'Deselect All') {
        // Deselect all
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

  if (isResourcesLoading || isRegionsLoading) {
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
          sx={{
            h2: {
              fontSize: '16px',
            },
          }}
          icon={EntityIcon}
          subtitle="Once you assign the resources, they will show up here."
          title="No resources associated with this alert definition."
        />
      </Stack>
    );
  }

  const filtersToRender = serviceToFiltersMap[serviceType ?? ''];
  const noticeStyles: React.CSSProperties = {
    alignItems: 'center',
    backgroundColor: theme.tokens.alias.Background.Normal,
    borderRadius: 1,
    display: 'flex',
    flexWrap: 'nowrap',
    marginBottom: 0,
    padding: theme.spacingFunction(16),
  };
  const selectionsRemaining =
    maxSelectionCount && selectedResources
      ? Math.max(0, maxSelectionCount - selectedResources.length)
      : undefined;

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
      <Grid container spacing={2}>
        <Grid
          sx={{
            alignItems: 'center',
          }}
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
          {/* Dynamically render service type based filters */}
          {filtersToRender.map(({ component, filterKey }, index) => (
            <Grid item key={`${index}_${filterKey}`} md={4} xs={12}>
              <AlertResourcesFilterRenderer
                componentProps={getAlertResourceFilterProps({
                  filterKey,
                  handleFilterChange,
                  handleFilteredRegionsChange,
                  regionOptions,
                  tagOptions: Array.from(
                    new Set(
                      resources
                        ? resources.flatMap(({ tags }) => tags ?? [])
                        : []
                    )
                  ),
                })}
                component={component}
              />
            </Grid>
          ))}
        </Grid>
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
        {errorText?.length && (
          <Grid item xs={12}>
            <AlertListNoticeMessages
              errorMessage={errorText}
              separator={MULTILINE_ERROR_SEPARATOR}
              style={noticeStyles}
              variant="error"
            />
          </Grid>
        )}
        {maxSelectionCount !== undefined && (
          <Grid item xs={12}>
            <AlertListNoticeMessages
              errorMessage={`You can select up to ${maxSelectionCount} resources.`}
              separator={MULTILINE_ERROR_SEPARATOR}
              style={noticeStyles}
              variant="warning"
            />
          </Grid>
        )}
        {isSelectionsNeeded &&
          !isDataLoadingError &&
          resources &&
          resources.length > 0 && (
            <Grid item xs={12}>
              <AlertsResourcesNotice
                handleSelectionChange={handleAllSelection}
                maxSelectionCount={maxSelectionCount}
                selectedResources={selectedResources.length}
                totalResources={resources?.length ?? 0}
              />
            </Grid>
          )}
        <Grid item xs={12}>
          <DisplayAlertResources
            scrollToElement={() =>
              scrollToElement(titleRef.current ?? scrollElement ?? null)
            }
            filteredResources={filteredResources}
            handleSelection={handleSelection}
            isDataLoadingError={isDataLoadingError}
            isSelectionsNeeded={isSelectionsNeeded}
            maxSelectionCount={maxSelectionCount}
            selectionsRemaining={selectionsRemaining}
            serviceType={serviceType}
          />
        </Grid>
      </Grid>
    </Stack>
  );
});

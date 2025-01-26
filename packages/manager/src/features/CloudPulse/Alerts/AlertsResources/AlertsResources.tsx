import { Checkbox, CircleProgress, Typography } from '@linode/ui';
import { Grid, styled, useTheme } from '@mui/material';
import React from 'react';

import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import { useRegionsQuery } from 'src/queries/regions/regions';

import {
  getFilteredResources,
  getRegionOptions,
  getRegionsIdLabelMap,
} from '../Utils/AlertResourceUtils';
import { AlertsRegionFilter } from './AlertsRegionFilter';
import { AlertsResourcesNotice } from './AlertsResourcesNotice';
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
   * This controls whether we need to show the checkbox in case of editing the resources
   */
  isSelectionsNeeded?: boolean;

  /**
   * The set of resource ids associated with the alerts, that needs to be displayed
   */
  resourceIds: string[];

  /**
   * The service type associated with the alerts like DBaaS, Linode etc.,
   */
  serviceType?: string;

  /**
   * Property to control the visibility of the title
   */
  showTitle?: boolean;
}

export const AlertResources = React.memo((props: AlertResourcesProp) => {
  const {
    alertLabel,
    handleResourcesSelection,
    isSelectionsNeeded,
    resourceIds,
    serviceType,
    showTitle,
  } = props;

  const [searchText, setSearchText] = React.useState<string>();

  const [filteredRegions, setFilteredRegions] = React.useState<string[]>();

  const [selectedResources, setSelectedResources] = React.useState<string[]>(
    resourceIds
  );

  const [selectedOnly, setSelectedOnly] = React.useState<boolean>(false);
  const pageSize = 25;

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

  React.useEffect(() => {
    if (resources && isSelectionsNeeded) {
      setSelectedResources(
        resources
          .filter((resource) => resourceIds.includes(resource.id))
          .map((resource) => resource.id)
      );
    }
  }, [resources, isSelectionsNeeded, resourceIds]);

  const {
    data: regions,
    isError: isRegionsError,
    isFetching: isRegionsFetching,
  } = useRegionsQuery();

  const handleSelection = React.useCallback(
    (ids: string[], isSelectionAction: boolean) => {
      const onlySelected = isSelectionAction
        ? selectedResources
        : selectedResources.filter((resource) => !ids.includes(resource));

      const newlySelected = ids.filter((id) => !selectedResources.includes(id));

      setSelectedResources([...onlySelected, ...newlySelected]);

      if (handleResourcesSelection) {
        handleResourcesSelection([...onlySelected, ...newlySelected]);
      }
    },
    [handleResourcesSelection, selectedResources]
  );

  // The map holds the id of the region to the entire region object that needs to be displayed in table
  const regionsIdToLabelMap: Map<string, Region> = React.useMemo(() => {
    return getRegionsIdLabelMap(regions);
  }, [regions]);

  /**
   * Holds the resources that are
   * filtered based on the passed resourceIds, typed searchText and filtered regions
   */
  const filteredResources = React.useMemo(() => {
    return getFilteredResources({
      data: resources,
      filteredRegions,
      isAdditionOrDeletionNeeded: isSelectionsNeeded,
      regionsIdToLabelMap,
      resourceIds,
      searchText,
      selectedOnly,
      selectedResources,
    });
  }, [
    resources,
    filteredRegions,
    isSelectionsNeeded,
    regionsIdToLabelMap,
    resourceIds,
    searchText,
    selectedOnly,
    selectedResources,
  ]);

  const handleAllSelection = React.useCallback(() => {
    if (!resources) {
      // Guard clause if data is undefined
      return;
    }

    if (selectedResources.length === resources.length) {
      // Unselect all
      setSelectedResources([]);
    } else {
      // Select all
      const allResources = resources.map((resource) => resource.id);
      setSelectedResources(allResources);
      if (handleResourcesSelection) {
        handleResourcesSelection(allResources);
      }
    }
  }, [handleResourcesSelection, resources, selectedResources]);

  /**
   * Holds the regions associated with the resources from list of regions
   */
  const regionOptions: Region[] = React.useMemo(() => {
    return getRegionOptions({
      data: resources,
      isAdditionOrDeletionNeeded: isSelectionsNeeded,
      regionsIdToLabelMap,
      resourceIds,
    });
  }, [resources, isSelectionsNeeded, regionsIdToLabelMap, resourceIds]);

  const titleRef = React.useRef<HTMLDivElement>(null); // when the page size, page number of table changes lets scroll until the title of this component

  if (isResourcesFetching || isRegionsFetching) {
    return <CircleProgress />;
  }

  const scrollToTitle = () => {
    if (titleRef.current) {
      window.scrollTo({
        behavior: 'smooth',
        top: titleRef.current.getBoundingClientRect().top + window.scrollY - 40, // Adjust offset if needed
      });
    }
  };

  return (
    <React.Fragment>
      {showTitle && (
        <Typography
          fontSize={theme.spacing(2.25)}
          marginBottom={2}
          ref={titleRef}
          variant="h2"
        >
          {alertLabel ?? 'Resources'}
        </Typography>
      )}
      {!isResourcesError &&
        !isRegionsError &&
        !isSelectionsNeeded &&
        resourceIds.length === 0 && (
          <StyledPlaceholder
            title={
              'No resources are currently assigned to this alert definition.'
            }
            icon={EntityIcon}
            subtitle="You can assign alerts during the resource creation process."
          />
        )}

      {(isSelectionsNeeded || resourceIds.length > 0) && (
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
            {isSelectionsNeeded && (
              <Grid
                sx={{
                  ml: {
                    md: 2,
                    xs: 0,
                  },
                }}
                item
                md={4}
                xs={12}
              >
                <Checkbox
                  disabled={
                    !(Boolean(selectedResources.length) || selectedOnly)
                  }
                  sx={{
                    maxHeight: '34px',
                    pt: theme.spacing(1.2),
                    svg: {
                      backgroundColor: theme.color.white,
                    },
                  }}
                  checked={selectedOnly}
                  data-testid="show_selected_only"
                  onClick={() => setSelectedOnly(!selectedOnly)}
                  text={'Show Selected Only'}
                  value={'Show Selected'}
                />
              </Grid>
            )}
          </Grid>
          {isSelectionsNeeded && !(isResourcesError || isRegionsError) && (
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
              noDataText={
                !(isResourcesError || isRegionsError) &&
                !Boolean(filteredResources?.length)
                  ? 'No data to display.'
                  : undefined
              }
              errorText={'Table data is unavailable. Please try again later.'}
              filteredResources={filteredResources}
              handleSelection={isSelectionsNeeded ? handleSelection : undefined}
              isDataLoadingError={isResourcesError || isRegionsError}
              isSelectionsNeeded={isSelectionsNeeded}
              pageSize={pageSize}
              scrollToTitle={scrollToTitle}
            />
          </Grid>
        </Grid>
      )}
    </React.Fragment>
  );
});

export const StyledPlaceholder = styled(Placeholder, {
  label: 'StyledPlaceholder',
})(({ theme }) => ({
  h1: {
    fontSize: theme.spacing(2.5),
  },
  h2: {
    fontSize: theme.spacing(2),
  },
  svg: {
    color: theme.color.green,
    maxHeight: theme.spacing(10.5),
  },
}));

import { CircleProgress, Typography } from '@linode/ui';
import { Grid, styled, useTheme } from '@mui/material';
import React from 'react';

import AlertsIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import { useRegionsQuery } from 'src/queries/regions/regions';

import {
  getRegionOptions,
  getRegionsIdLabelMap,
} from '../Utils/AlertResourceUtils';

import type { Region } from '@linode/api-v4';
import { AlertsRegionFilter } from './AlertsRegionFilter';

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
  const { alertLabel, resourceIds, serviceType } = props;

  const [searchText, setSearchText] = React.useState<string>();

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

  const [, setFilteredRegions] = React.useState<string[]>([]);

  const {
    data: regions,
    isError: isRegionsError,
    isFetching: isRegionsFetching,
  } = useRegionsQuery();

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

  return (
    <React.Fragment>
      <Typography
        fontSize={theme.spacing(2.25)}
        marginBottom={2}
        ref={titleRef}
        variant="h2"
      >
        {alertLabel ?? 'Resources'}
      </Typography>
      {!isResourcesError && !isRegionsError && resourceIds.length === 0 && (
        <StyledPlaceholder
          title={
            'No resources are currently assigned to this alert definition.'
          }
          icon={AlertsIcon}
          subtitle="You can assign alerts during the resource creation process."
        />
      )}

      {resourceIds.length > 0 && (
        <Grid container spacing={3}>
          <Grid columnSpacing={1} container item rowSpacing={3} xs={12}>
            <Grid item md={3} xs={12}>
              <DebouncedSearchTextField
                onSearch={(value) => {
                  setSearchText(value);
                }}
                clearable
                debounceTime={300}
                hideLabel
                isSearching={false}
                placeholder="Search for a Resource"
                value={searchText || ''}
                label="Search for a Resource"
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

          {/* TODO: Here a table will be added to display the resources based the filters applied and also error handling */}
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
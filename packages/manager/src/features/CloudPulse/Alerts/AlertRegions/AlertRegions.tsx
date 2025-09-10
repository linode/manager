import { useRegionsQuery } from '@linode/queries';
import { Box, Checkbox, CircleProgress, Stack } from '@linode/ui';
import { Typography } from '@linode/ui';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { RESOURCE_FILTER_MAP } from '../../Utils/constants';
import {
  type AlertFormMode,
  REGION_GROUP_INFO_MESSAGE,
  type SelectDeselectAll,
} from '../constants';
import { AlertListNoticeMessages } from '../Utils/AlertListNoticeMessages';
import { AlertSelectedInfoNotice } from '../Utils/AlertSelectedInfoNotice';
import { getFilteredRegions } from '../Utils/utils';
import { DisplayAlertRegions } from './DisplayAlertRegions';

import type { AlertRegion } from './DisplayAlertRegions';
import type { CloudPulseServiceType } from '@linode/api-v4';

interface AlertRegionsProps {
  /**
   * Error message to be displayed when there is an error.
   */
  errorText?: string;
  /**
   * Function to handle changes in the selected regions.
   */
  handleChange?: (regionIds: string[]) => void;
  /**
   * Flag to indicate if the component is in view-only mode.
   */
  mode?: AlertFormMode;
  /**
   * The service type for which the regions are being selected.
   */
  serviceType: CloudPulseServiceType | null;
  /**
   * The selected regions.
   */
  value?: string[];
}

export const AlertRegions = React.memo((props: AlertRegionsProps) => {
  const { serviceType, handleChange, value = [], errorText, mode } = props;
  const [searchText, setSearchText] = React.useState<string>('');
  const { data: regions, isLoading: isRegionsLoading } = useRegionsQuery();
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>(value);
  const [showSelected, setShowSelected] = React.useState<boolean>(false);

  // const supportedRegionIds = getSupportedRegionIds(regions, serviceType);
  // const xFilterToBeApplied: Filter | undefined = React.useMemo(() => {
  //   if (serviceType === 'firewall') {
  //     return undefined;
  //   }

  //   const regionFilter: Filter = supportedRegionIds
  //     ? {
  //         '+or': supportedRegionIds.map((regionId) => ({
  //           region: regionId,
  //         })),
  //       }
  //     : {};

  //   // if service type is other than dbaas, return only region filter
  //   if (serviceType !== 'dbaas') {
  //     return regionFilter;
  //   }

  //   // Always include platform filter for 'dbaas'
  //   const platformFilter: Filter = { platform: 'rdbms-default' };

  //   // If alertType is not 'system' or alertClass is not defined, return only platform filter
  //   if (alertType !== 'system' || !alertClass) {
  //     return platformFilter;
  //   }

  //   // Dynamically exclude 'dedicated' if alertClass is 'shared'
  //   const filteredTypes =
  //     alertClass === 'shared'
  //       ? Object.keys(databaseTypeClassMap).filter(
  //           (type) => type !== 'dedicated'
  //         )
  //       : [alertClass];

  //   // Apply type filter only for DBaaS user alerts with a valid alertClass based on above filtered types
  //   const typeFilter: Filter = {
  //     '+or': filteredTypes.map((dbType) => ({
  //       type: {
  //         '+contains': dbType,
  //       },
  //     })),
  //   };

  //   // Combine all the filters
  //   return { ...platformFilter, '+and': [typeFilter, regionFilter] };
  // }, [alertClass, alertType, serviceType, supportedRegionIds]);

  const { data: resources, isLoading: isResourcesLoading } = useResourcesQuery(
    Boolean(serviceType && regions?.length),
    serviceType === null ? undefined : serviceType,
    {},
    { ...(RESOURCE_FILTER_MAP[serviceType ?? ''] ?? {}) }
  );

  const handleSelectionChange = React.useCallback(
    (regionId: string, isChecked: boolean) => {
      if (isChecked) {
        setSelectedRegions((prev) => {
          const newValue = [...prev, regionId];
          if (handleChange) {
            handleChange(newValue);
          }
          return newValue;
        });
        return;
      }

      setSelectedRegions((prev) => {
        const newValue = prev.filter((region) => region !== regionId);

        if (handleChange) {
          handleChange(newValue);
        }
        return newValue;
      });
    },
    [handleChange]
  );

  const filteredRegionsWithStatus: AlertRegion[] = React.useMemo(
    () =>
      getFilteredRegions({
        serviceType,
        selectedRegions,
        resources,
        regions,
      }),
    [regions, resources, selectedRegions, serviceType]
  );

  const handleSelectAll = React.useCallback(
    (action: SelectDeselectAll) => {
      let regionIds: string[] = [];
      if (action === 'Select All') {
        regionIds = filteredRegionsWithStatus?.map((region) => region.id) ?? [];
      }

      setSelectedRegions(regionIds);
      if (handleChange) {
        handleChange(regionIds);
      }
    },
    [filteredRegionsWithStatus, handleChange]
  );

  if (isRegionsLoading || isResourcesLoading) {
    return <CircleProgress />;
  }
  const filteredRegionsBySearchText = filteredRegionsWithStatus.filter(
    ({ label, checked }) =>
      label.toLowerCase().includes(searchText.toLowerCase()) &&
      ((mode && checked) || !mode)
  );

  return (
    <Stack gap={2}>
      {mode === 'view' && <Typography variant="h2">Regions</Typography>}

      <AlertListNoticeMessages
        errorMessage={REGION_GROUP_INFO_MESSAGE}
        variant="info"
      />

      <Box display="flex" gap={2}>
        <DebouncedSearchTextField
          data-testid="region-search"
          fullWidth
          hideLabel
          label="Search for a Region"
          onSearch={setSearchText}
          placeholder="Search for a Region"
          sx={{
            width: '250px',
          }}
          value={searchText}
        />
        {mode !== 'view' && (
          <Checkbox
            data-testid="show-selected-only"
            onChange={(_event, checked: boolean) => setShowSelected(checked)}
            sx={(theme) => ({
              svg: {
                backgroundColor: theme.tokens.color.Neutrals.White,
              },
            })}
            sxFormLabel={{
              marginLeft: -1,
            }}
            text="Show Selected Only"
            value="Show Selected"
          />
        )}
      </Box>
      {errorText && (
        <AlertListNoticeMessages errorMessage={errorText} variant="error" />
      )}

      {mode !== 'view' && (
        <AlertSelectedInfoNotice
          handleSelectionChange={handleSelectAll}
          property="regions"
          selectedCount={selectedRegions.length}
          totalCount={filteredRegionsWithStatus.length}
        />
      )}
      <DisplayAlertRegions
        handleSelectAll={handleSelectAll}
        handleSelectionChange={handleSelectionChange}
        isAllSelected={
          filteredRegionsWithStatus.length > 0 &&
          selectedRegions.length === filteredRegionsWithStatus.length
        }
        isSomeSelected={
          selectedRegions.length > 0 &&
          selectedRegions.length !== filteredRegionsWithStatus.length
        }
        mode={mode}
        regions={filteredRegionsBySearchText}
        showSelected={showSelected}
      />
    </Stack>
  );
});

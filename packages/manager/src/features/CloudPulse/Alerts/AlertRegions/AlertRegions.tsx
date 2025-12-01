import { useRegionsQuery } from '@linode/queries';
import { Box, Checkbox, CircleProgress, Stack } from '@linode/ui';
import { Typography } from '@linode/ui';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { RESOURCE_FILTER_MAP } from '../../Utils/constants';
import { getFilterFn } from '../../Utils/utils';
import {
  type AlertFormMode,
  REGION_GROUP_INFO_MESSAGE,
  type SelectDeselectAll,
} from '../constants';
import { AlertListNoticeMessages } from '../Utils/AlertListNoticeMessages';
import { scrollToElement } from '../Utils/AlertResourceUtils';
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
   * The element until which we need to scroll on pagination and order change
   */
  scrollElement?: HTMLDivElement | null;
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
  const {
    serviceType,
    handleChange,
    value = [],
    errorText,
    mode,
    scrollElement,
  } = props;
  const [searchText, setSearchText] = React.useState<string>('');
  const { data: regions, isLoading: isRegionsLoading } = useRegionsQuery();
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>(value);
  const [showSelected, setShowSelected] = React.useState<boolean>(false);
  const { data: resources, isLoading: isResourcesLoading } = useResourcesQuery(
    Boolean(serviceType && regions?.length),
    serviceType === null ? undefined : serviceType,
    {},
    { ...(RESOURCE_FILTER_MAP[serviceType ?? ''] ?? {}) },
    undefined,
    getFilterFn(serviceType)
  );

  const titleRef = React.useRef<HTMLDivElement>(null); // Reference to the component title, used for scrolling to the title when the table's page size or page number changes.

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
    ({ label, checked, id }) =>
      (label.toLowerCase().includes(searchText.toLowerCase()) ||
        id.includes(searchText.toLowerCase())) &&
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
        scrollToElement={() =>
          scrollToElement(titleRef.current ?? scrollElement ?? null)
        }
        showSelected={showSelected}
      />
    </Stack>
  );
});

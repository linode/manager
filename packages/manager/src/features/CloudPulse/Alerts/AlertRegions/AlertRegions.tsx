import { useRegionsQuery } from '@linode/queries';
import { Box, Checkbox, CircleProgress, Stack } from '@linode/ui';
import { Typography } from '@linode/ui';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useFlags } from 'src/hooks/useFlags';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { AlertListNoticeMessages } from '../Utils/AlertListNoticeMessages';
import { AlertSelectedInfoNotice } from '../Utils/AlertSelectedInfoNotice';
import { getFilteredRegions } from '../Utils/utils';
import { DisplayAlertRegions } from './DisplayAlertRegions';

import type { SelectDeselectAll } from '../constants';
import type { AlertRegion } from './DisplayAlertRegions';
import type { AlertServiceType, Filter } from '@linode/api-v4';

interface AlertRegionsProps {
  errorText?: string;
  handleChange?: (regionIds: string[]) => void;
  serviceType: AlertServiceType | null;
  value?: string[];
  viewOnly?: boolean;
}

export const AlertRegions = React.memo((props: AlertRegionsProps) => {
  const { serviceType, handleChange, value = [], errorText, viewOnly } = props;
  const { aclpResourceTypeMap } = useFlags();
  const [searchText, setSearchText] = React.useState<string>('');
  const { data: regions, isLoading: isRegionsLoading } = useRegionsQuery();
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>(value);
  const [showSelected, setShowSelected] = React.useState<boolean>(false);

  const resourceFilterMap: Record<string, Filter> = {
    dbaas: {
      platform: 'rdbms-default',
    },
  };
  const { data: resources, isLoading: isResourcesLoading } = useResourcesQuery(
    Boolean(serviceType && regions?.length),
    serviceType === null ? undefined : serviceType,
    {},
    {
      ...(resourceFilterMap[serviceType ?? ''] ?? {}),
    }
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
        aclpResourceTypeMap,
      }),
    [aclpResourceTypeMap, regions, resources, selectedRegions, serviceType]
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
      ((viewOnly && checked) || !viewOnly)
  );

  return (
    <Stack gap={2}>
      {viewOnly && <Typography variant="h2">Regions</Typography>}
      {!viewOnly && (
        <AlertListNoticeMessages
          errorMessage="All resources associated with selected regions will be included in this alert definition."
          variant="warning"
        />
      )}

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
        {!viewOnly && (
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

      {!viewOnly && (
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
        regions={filteredRegionsBySearchText}
        showSelected={showSelected}
        viewOnly={viewOnly}
      />
    </Stack>
  );
});

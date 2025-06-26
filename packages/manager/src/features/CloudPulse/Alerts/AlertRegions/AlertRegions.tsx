import { useRegionsQuery } from '@linode/queries';
import { Box, Checkbox, CircleProgress, Stack } from '@linode/ui';
import { Typography } from '@linode/ui';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useFlags } from 'src/hooks/useFlags';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { type AlertFormMode } from '../constants';
import { AlertListNoticeMessages } from '../Utils/AlertListNoticeMessages';
import { getSupportedRegions } from '../Utils/utils';
import { DisplayAlertRegions } from './DisplayAlertRegions';

import type { AlertServiceType, Filter, Region } from '@linode/api-v4';

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
  serviceType: AlertServiceType | null;
  /**
   * The selected regions.
   */
  value?: string[];
}

export const AlertRegions = React.memo((props: AlertRegionsProps) => {
  const { serviceType, handleChange, value = [], errorText, mode } = props;
  const { aclpResourceTypeMap } = useFlags();
  const [searchText, setSearchText] = React.useState<string>('');
  const { data: regions, isLoading: isRegionsLoading } = useRegionsQuery();

  // Todo: State variable will be added when checkbox functionality implemented
  const [, setSelectedRegions] = React.useState<string[]>(value);
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

  const filteredRegionsWithStatus: Region[] = React.useMemo(
    () =>
      getSupportedRegions({
        serviceType,
        resources,
        regions,
        aclpResourceTypeMap,
      }),
    [aclpResourceTypeMap, regions, resources, serviceType]
  );

  if (isRegionsLoading || isResourcesLoading) {
    return <CircleProgress />;
  }
  const filteredRegionsBySearchText = filteredRegionsWithStatus.filter(
    ({ label }) => label.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Stack gap={2}>
      {mode === 'view' && <Typography variant="h2">Regions</Typography>}

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

      <DisplayAlertRegions
        handleSelectionChange={handleSelectionChange}
        mode={mode}
        regions={filteredRegionsBySearchText}
        showSelected={showSelected}
      />
    </Stack>
  );
});

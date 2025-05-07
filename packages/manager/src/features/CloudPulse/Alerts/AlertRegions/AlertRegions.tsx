import { useRegionsQuery } from '@linode/queries';
import { Box, Checkbox, CircleProgress, Stack } from '@linode/ui';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useFlags } from 'src/hooks/useFlags';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { AlertListNoticeMessages } from '../Utils/AlertListNoticeMessages';
import { DisplayAlertRegions } from './DisplayAlertRegions';

import type { AlertServiceType, Filter, Region } from '@linode/api-v4';
import type { CloudPulseResourceTypeMapFlag } from 'src/featureFlags';

interface AlertRegionsProps {
  handleChange?: (regionIds: string[]) => void;
  serviceType: AlertServiceType | null;
}

export const AlertRegions = React.memo((props: AlertRegionsProps) => {
  const { serviceType } = props;
  const flags = useFlags();
  const [searchText, setSearchText] = React.useState<string>('');
  const { data: regions, isLoading: isRegionsLoading } = useRegionsQuery();
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>([]);

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

  const handleSelectionChange = (regionId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedRegions((prev) => [...prev, regionId]);
      return;
    }

    setSelectedRegions((prev) => prev.filter((id) => id !== regionId));
  };

  const supportedRegions = React.useMemo<Region[] | undefined>(() => {
    const resourceTypeFlag = flags.aclpResourceTypeMap?.find(
      (item: CloudPulseResourceTypeMapFlag) => item.serviceType === serviceType
    );

    if (
      resourceTypeFlag?.supportedRegionIds === null ||
      resourceTypeFlag?.supportedRegionIds === undefined
    ) {
      return regions;
    }

    const supportedRegionsIdList = resourceTypeFlag.supportedRegionIds
      .split(',')
      .map((regionId: string) => regionId.trim());

    return regions?.filter(({ id }) => supportedRegionsIdList.includes(id));
  }, [flags.aclpResourceTypeMap, regions, serviceType]);

  const supportedRegionsFromResources =
    supportedRegions?.filter(
      ({ id, label }) =>
        resources?.some(({ region }) => region === id) &&
        (!searchText || label.toLowerCase().includes(searchText.toLowerCase()))
    ) ?? [];

  const filteredRegionsWithStatus: AlertRegion[] =
    supportedRegionsFromResources.map(({ label, id }) => {
      const data = { label, id };

      if (selectedRegions.includes(id)) {
        return {
          ...data,
          checked: true,
        };
      }
      return {
        ...data,
        checked: false,
      };
    });



  if (isRegionsLoading || isResourcesLoading) {
    return <CircleProgress />;
  }

  return (
    <Stack gap={2}>
      <AlertListNoticeMessages
        errorMessage="All resources associated with selected regions will be included in this alert definition."
        variant="warning"
      />

      <Box display="flex" gap={2}>
        <DebouncedSearchTextField
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
        <Checkbox
          data-testid="show_selected_only"
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
      </Box>

      <DisplayAlertRegions
        handleSelectionChange={handleSelectionChange}
        regions={filteredRegionsWithStatus}
      />
    </Stack>
  );
});

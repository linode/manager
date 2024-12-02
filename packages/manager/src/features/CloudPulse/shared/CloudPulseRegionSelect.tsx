import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { FILTER_CONFIG } from '../Utils/FilterConfig';

import type { CloudPulseServiceTypeFilters } from '../Utils/models';
import type { Dashboard, FilterValue, Region } from '@linode/api-v4';

export interface CloudPulseRegionSelectProps {
  defaultValue?: FilterValue;
  handleRegionChange: (region: string | undefined, savePref?: boolean) => void;
  label: string;
  placeholder?: string;
  savePreferences?: boolean;
  selectedDashboard: Dashboard | undefined;
}

export const CloudPulseRegionSelect = React.memo(
  (props: CloudPulseRegionSelectProps) => {
    const { data: regions, isError, isLoading } = useRegionsQuery();

    const flags = useFlags();

    const {
      defaultValue,
      handleRegionChange,
      label,
      placeholder,
      savePreferences,
      selectedDashboard,
    } = props;

    const currentFilterConfig:
      | CloudPulseServiceTypeFilters
      | undefined = FILTER_CONFIG.get(
      selectedDashboard?.service_type
    )?.filters.filter(
      (config) => config.configuration.filterKey === 'region'
    )[0];
    // Capture the current capability from corresponding filter config
    const capability = currentFilterConfig?.configuration.capability;

    const [selectedRegion, setSelectedRegion] = React.useState<string>();
    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      if (regions && savePreferences) {
        const region = defaultValue
          ? regions.find((regionObj) => regionObj.id === defaultValue)?.id
          : undefined;
        handleRegionChange(region);
        setSelectedRegion(region);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [regions]);

    // validate launchDrakly region_ids with the ids from the fetched 'all-regions'
    const supportedRegions = React.useMemo<Region[] | undefined>(() => {
      const serviceTypeFlag = flags.aclpServiceTypeMap?.find(
        (item) => item.serviceType === selectedDashboard?.service_type
      );

      const supportedRegionsIdList = serviceTypeFlag?.supportedRegionIds
        ?.split(',')
        .map((regionId) => regionId.trim());

      if (!supportedRegionsIdList?.length) {
        return regions;
      }

      const validatedRegions = regions?.filter((region) =>
        supportedRegionsIdList?.includes(region.id)
      );

      return validatedRegions ? validatedRegions : regions;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flags.aclpServiceTypeMap, regions, selectedDashboard?.service_type]);

    return (
      <RegionSelect
        onChange={(_, region) => {
          setSelectedRegion(region?.id);
          handleRegionChange(region?.id, savePreferences);
        }}
        currentCapability={capability}
        data-testid="region-select"
        disableClearable={false}
        disabled={!selectedDashboard || !regions}
        errorText={isError ? `Failed to fetch ${label || 'Regions'}.` : ''}
        fullWidth
        label={label || 'Region'}
        loading={isLoading}
        noMarginTop
        placeholder={placeholder ?? 'Select a Region'}
        regions={supportedRegions ? supportedRegions : []}
        value={selectedRegion}
      />
    );
  },
  (prevProps, nextProps) =>
    prevProps.selectedDashboard?.id === nextProps.selectedDashboard?.id
);

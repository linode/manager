import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { FILTER_CONFIG } from '../Utils/FilterConfig';

import type { Dashboard, FilterValue, Region } from '@linode/api-v4';
import type { CloudPulseResourceTypeMapFlag } from 'src/featureFlags';

export interface CloudPulseRegionSelectProps {
  defaultValue?: FilterValue;
  handleRegionChange: (
    region: string | undefined,
    labels: string[],
    savePref?: boolean
  ) => void;
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

    const serviceType: string | undefined = selectedDashboard?.service_type;
    const capability = serviceType
      ? FILTER_CONFIG.get(serviceType)?.capability
      : undefined;

    const [selectedRegion, setSelectedRegion] = React.useState<string>();
    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      if (regions && savePreferences) {
        const region = defaultValue
          ? regions.find((regionObj) => regionObj.id === defaultValue)
          : undefined;
        handleRegionChange(region?.id, region ? [region.label] : []);
        setSelectedRegion(region?.id);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [regions]);

    // validate launchDarkly region_ids with the ids from the fetched 'all-regions'
    const supportedRegions = React.useMemo<Region[] | undefined>(() => {
      const resourceTypeFlag = flags.aclpResourceTypeMap?.find(
        (item: CloudPulseResourceTypeMapFlag) =>
          item.serviceType === serviceType
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

      return regions?.filter((region) =>
        supportedRegionsIdList.includes(region.id)
      );
    }, [flags.aclpResourceTypeMap, regions, serviceType]);

    return (
      <RegionSelect
        onChange={(_, region) => {
          setSelectedRegion(region?.id);
          handleRegionChange(
            region?.id,
            region ? [region.label] : [],
            savePreferences
          );
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
        regions={supportedRegions ?? []}
        value={selectedRegion}
      />
    );
  },
  (prevProps, nextProps) =>
    prevProps.selectedDashboard?.id === nextProps.selectedDashboard?.id
);

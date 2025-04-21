import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useFlags } from 'src/hooks/useFlags';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { deepEqual } from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';

import type { Dashboard, Filter, FilterValue, Region } from '@linode/api-v4';
import type { CloudPulseResourceTypeMapFlag } from 'src/featureFlags';

export interface CloudPulseRegionSelectProps {
  defaultValue?: FilterValue;
  disabled: boolean | undefined;
  handleRegionChange: (
    region: string | undefined,
    labels: string[],
    savePref?: boolean
  ) => void;
  label: string;
  placeholder?: string;
  savePreferences?: boolean;
  selectedDashboard: Dashboard | undefined;
  xFilter?: Filter;
}

export const CloudPulseRegionSelect = React.memo(
  (props: CloudPulseRegionSelectProps) => {
    const {
      defaultValue,
      handleRegionChange,
      label,
      placeholder,
      savePreferences,
      selectedDashboard,
      disabled = false,
      xFilter,
    } = props;

    const resourceFilterMap: Record<string, Filter> = {
      dbaas: {
        platform: 'rdbms-default',
      },
    };

    const { data: regions, isError, isLoading } = useRegionsQuery();
    const {
      data: resources,
      isError: isResourcesError,
      isLoading: isResourcesLoading,
    } = useResourcesQuery(
      selectedDashboard !== undefined && Boolean(regions?.length),
      selectedDashboard?.service_type,
      {},
      {
        ...(resourceFilterMap[selectedDashboard?.service_type ?? ''] ?? {}),
        ...(xFilter ?? {}), // the usual xFilters
      }
    );

    const flags = useFlags();
    const { isGeckoLAEnabled } = useIsGeckoEnabled(
      flags.gecko2?.enabled,
      flags.gecko2?.la
    );

    const serviceType: string | undefined = selectedDashboard?.service_type;
    const capability = serviceType
      ? FILTER_CONFIG.get(serviceType)?.capability
      : undefined;

    const [selectedRegion, setSelectedRegion] = React.useState<string>();
    React.useEffect(() => {
      // If the component is disabled and there's a previously selected region,
      // we clear the selected region.
      if (disabled && selectedRegion) {
        setSelectedRegion(undefined);
      }

      // If component is not disabled, regions have loaded, preferences should be saved,
      // and there's no selected region — attempt to preselect from defaultValue.
      if (!disabled && regions && savePreferences && !selectedRegion) {
        // Try to find the region corresponding to the saved default value
        const region = defaultValue
          ? regions.find((regionObj) => regionObj.id === defaultValue)
          : undefined;

        // Notify parent and set internal state
        handleRegionChange(region?.id, region ? [region.label] : []);
        setSelectedRegion(region?.id);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      xFilter, // Reacts to filter changes (to reset region)
      regions, // Function to call on change
    ]);

    // validate launchDarkly region_ids with the ids from the fetched 'all-regions'
    const supportedRegions = React.useMemo<Region[] | undefined>(() => {
      const resourceTypeFlag = flags.aclpResourceTypeMap?.find(
        (item: CloudPulseResourceTypeMapFlag) =>
          item.serviceType === serviceType
      );

      const regionsWithResources =
        resources
          ?.filter((resource) => resource.region)
          .map((resource) => resource.region) ?? [];

      if (
        resourceTypeFlag?.supportedRegionIds === null ||
        resourceTypeFlag?.supportedRegionIds === undefined
      ) {
        return regions?.filter((region) =>
          regionsWithResources.includes(region.id)
        );
      }

      const supportedRegionsIdList = resourceTypeFlag.supportedRegionIds
        .split(',')
        .map((regionId: string) => regionId.trim());

      return regions
        ?.filter((region) => supportedRegionsIdList.includes(region.id))
        .filter((region) => regionsWithResources.includes(region.id));
    }, [flags.aclpResourceTypeMap, regions, serviceType, resources]);
    const resourceLabel =
      FILTER_CONFIG.get(serviceType ?? '')?.filters.find(
        (value) => value.name === 'Resources'
      )?.configuration.name ?? 'Resources';

    const errorMessage = isError
      ? `Failed to fetch ${label || 'Regions'}.`
      : isResourcesError
        ? `Failed to fetch ${resourceLabel}.`
        : '';

    return (
      <RegionSelect
        currentCapability={capability}
        data-testid="region-select"
        disableClearable={false}
        disabled={!selectedDashboard || !regions || disabled || !resources}
        errorText={errorMessage}
        fullWidth
        isGeckoLAEnabled={isGeckoLAEnabled}
        label={label || 'Region'}
        loading={isLoading || isResourcesLoading}
        noMarginTop
        onChange={(_, region) => {
          setSelectedRegion(region?.id);
          handleRegionChange(
            region?.id,
            region ? [region.label] : [],
            savePreferences
          );
        }}
        placeholder={placeholder ?? 'Select a Region'}
        regions={supportedRegions ?? []}
        value={selectedRegion}
      />
    );
  },
  (prevProps, nextProps) =>
    prevProps.selectedDashboard?.id === nextProps.selectedDashboard?.id &&
    deepEqual(prevProps.xFilter, nextProps.xFilter)
);

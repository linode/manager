import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useFlags } from 'src/hooks/useFlags';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';

import { useFetchOptions } from '../Alerts/CreateAlert/Criteria/DimensionFilterValue/useFetchOptions';
import { filterRegionByServiceType } from '../Alerts/Utils/utils';
import {
  LINODE_REGION,
  NO_REGION_MESSAGE,
  RESOURCE_FILTER_MAP,
} from '../Utils/constants';
import { deepEqual, filterUsingDependentFilters } from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';

import type { Item } from '../Alerts/constants';
import type { CloudPulseMetricsFilter } from '../Dashboard/CloudPulseDashboardLanding';
import type { Dashboard, FilterValue, Region } from '@linode/api-v4';

export interface CloudPulseRegionSelectProps {
  defaultValue?: FilterValue;
  disabled?: boolean;
  filterKey: string;
  handleRegionChange: (
    filterKey: string,
    region: string | undefined,
    labels: string[],
    savePref?: boolean
  ) => void;
  label: string;
  placeholder?: string;
  savePreferences?: boolean;
  selectedDashboard: Dashboard | undefined;
  selectedEntities: string[];
  xFilter?: CloudPulseMetricsFilter;
}

export const CloudPulseRegionSelect = React.memo(
  (props: CloudPulseRegionSelectProps) => {
    const {
      defaultValue,
      filterKey,
      handleRegionChange,
      label,
      placeholder,
      savePreferences,
      selectedDashboard,
      selectedEntities,
      disabled = false,
      xFilter,
    } = props;

    const { data: regions, isError, isLoading } = useRegionsQuery();
    const {
      data: resources,
      isError: isResourcesError,
      isLoading: isResourcesLoading,
    } = useResourcesQuery(
      !disabled && selectedDashboard !== undefined && Boolean(regions?.length),
      selectedDashboard?.service_type,
      {},
      {
        ...(RESOURCE_FILTER_MAP[selectedDashboard?.service_type ?? ''] ?? {}),
      }
    );

    const flags = useFlags();
    const { isGeckoLAEnabled } = useIsGeckoEnabled(
      flags.gecko2?.enabled,
      flags.gecko2?.la
    );

    const dashboardId = selectedDashboard?.id;
    const serviceType = selectedDashboard?.service_type;
    const capability = dashboardId
      ? FILTER_CONFIG.get(dashboardId)?.capability
      : undefined;

    const [selectedRegion, setSelectedRegion] = React.useState<string>();

    const {
      values: linodeRegions,
      isLoading: isLinodeRegionIdLoading,
      isError: isLinodeRegionIdError,
    } = useFetchOptions({
      dimensionLabel: filterKey,
      entities: selectedEntities,
      regions,
      serviceType,
      type: 'metrics',
    }).map((option: Item<string, string>) => option.value);

    const supportedLinodeRegions = React.useMemo(() => {
      return (
        regions?.filter((region) => linodeRegions?.includes(region.id)) ?? []
      );
    }, [regions, linodeRegions]);

    const supportedRegions = React.useMemo<Region[]>(() => {
      return filterRegionByServiceType('metrics', regions, serviceType);
    }, [regions, serviceType]);

    const supportedRegionsFromResources = React.useMemo(() => {
      if (filterKey === LINODE_REGION) {
        return supportedLinodeRegions;
      }
      return supportedRegions.filter(({ id }) =>
        filterUsingDependentFilters(resources, xFilter)?.some(
          ({ region }) => region === id
        )
      );
    }, [
      filterKey,
      supportedLinodeRegions,
      supportedRegions,
      resources,
      xFilter,
    ]);

    const dependencyKey = supportedLinodeRegions
      .map((region) => region.id)
      .sort()
      .join(',');

    React.useEffect(() => {
      if (disabled && !selectedRegion) {
        return; // no need to do anything
      }
      // If component is not disabled, regions have loaded, preferences should be saved,
      // and there's no selected region — attempt to preselect from defaultValue.
      if (
        !disabled &&
        regions &&
        savePreferences &&
        selectedRegion === undefined
      ) {
        // Try to find the region corresponding to the saved default value
        const region = defaultValue
          ? regions.find((regionObj) => regionObj.id === defaultValue)
          : undefined;
        // Notify parent and set internal state
        handleRegionChange(filterKey, region?.id, region ? [region.label] : []);
        setSelectedRegion(region?.id);
      } else if (
        filterKey === LINODE_REGION &&
        !savePreferences &&
        supportedRegionsFromResources?.length &&
        selectedRegion === undefined
      ) {
        // Select the first region from the supported regions if savePreferences is false
        const defaultRegionId = supportedRegionsFromResources[0].id;
        const defaultRegionLabel = supportedRegionsFromResources[0].label;
        handleRegionChange(filterKey, defaultRegionId, [defaultRegionLabel]);
        setSelectedRegion(defaultRegionId);
      } else {
        if (!disabled && filterKey === LINODE_REGION && selectedRegion) {
          return;
        }
        if (selectedRegion !== undefined) {
          setSelectedRegion('');
        }
        handleRegionChange(filterKey, undefined, []);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      xFilter, // Reacts to filter changes (to reset region)
      regions, // Function to call on change
      dependencyKey, // Reacts to linode region changes
    ]);

    return (
      <RegionSelect
        currentCapability={capability}
        data-testid="region-select"
        disableClearable={false}
        disabled={!selectedDashboard || !regions || disabled || !resources}
        errorText={
          isError || isResourcesError || isLinodeRegionIdError
            ? `Failed to fetch ${label || 'Regions'}.`
            : ''
        }
        fullWidth
        isGeckoLAEnabled={isGeckoLAEnabled}
        label={label || 'Region'}
        loading={
          !disabled &&
          (isLoading || isResourcesLoading || isLinodeRegionIdLoading)
        }
        noMarginTop
        noOptionsText={
          NO_REGION_MESSAGE[selectedDashboard?.service_type ?? ''] ??
          'No Regions Available.'
        }
        onChange={(_, region) => {
          setSelectedRegion(region?.id ?? '');
          handleRegionChange(
            filterKey,
            region?.id,
            region ? [region.label] : [],
            savePreferences
          );
        }}
        placeholder={placeholder ?? 'Select a Region'}
        regions={supportedRegionsFromResources}
        value={
          supportedRegionsFromResources?.length
            ? (selectedRegion ?? null)
            : null
        }
      />
    );
  },
  (prevProps, nextProps) =>
    prevProps.selectedDashboard?.id === nextProps.selectedDashboard?.id &&
    deepEqual(prevProps.xFilter, nextProps.xFilter)
);

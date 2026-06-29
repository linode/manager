import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { useObjectStorageBucketQueriesByRegions } from 'src/features/ObjectStorage/hooks/useObjectStorageBucketQueriesByRegions';
import { useObjectStorageRegionsWithAssignedEndpoints } from 'src/features/ObjectStorage/hooks/useObjectStorageRegionsWithAssignedEndpoints';
import { RegionMultiSelect } from 'src/features/ObjectStorage/Partials/RegionMultiSelect';
import {
  filterSet,
  matchesFilter,
  parseCsvSet,
  toSortedCsv,
  toStringSet,
} from 'src/features/ObjectStorage/utilities';

import { useIsObjectStorageGen2Enabled } from '../hooks/useIsObjectStorageGen2Enabled';
import { EndpointMultiselect } from '../Partials/EndpointMultiselect';

import type { EndpointMultiselectValue } from '../Partials/EndpointMultiselect';

type BucketLandingSearch = {
  endpoints?: string;
  regions?: string;
};

export interface BucketLandingFiltersProps {
  /** Optional callback so the parent can react to filter changes. */
  onFiltersChange?: (next: {
    endpointsFilter: null | Set<string>;
    regionIdsFilter: null | Set<string>;
  }) => void;
}

export const BucketLandingFilters = (props: BucketLandingFiltersProps) => {
  const { onFiltersChange } = props;

  const {
    regionsWithAssignedEndpoints,
    objectStorageEndpoints,
    isLoading: areRegionsLoading,
  } = useObjectStorageRegionsWithAssignedEndpoints();

  // Don't retry on mount because we don't want to trigger refetching of buckets
  // when the user is interacting with the filters.
  const { isLoading: areBucketsLoading, bucketQueriesByRegions } =
    useObjectStorageBucketQueriesByRegions({ retryOnMount: false });

  const regionMultiselectOptions = React.useMemo(() => {
    if (!regionsWithAssignedEndpoints || areBucketsLoading) {
      return [];
    }

    // After buckets are loaded, only show regions that we have non-empty bucket data for.
    return regionsWithAssignedEndpoints.filter((region) => {
      const regionBuckets = bucketQueriesByRegions?.[region.id]?.data;
      return Array.isArray(regionBuckets) && regionBuckets.length > 0;
    });
  }, [areBucketsLoading, regionsWithAssignedEndpoints, bucketQueriesByRegions]);

  const areFiltersLoading = areRegionsLoading || areBucketsLoading;

  const navigate = useNavigate({ from: '/object-storage/buckets' });
  const search = useSearch({
    from: '/object-storage/buckets',
  }) as BucketLandingSearch;

  const { isObjectStorageGen2Enabled } = useIsObjectStorageGen2Enabled();

  const regionIdsFilter = React.useMemo(
    () => parseCsvSet(search.regions),
    [search.regions]
  );

  const endpointsFilter = React.useMemo(
    () => parseCsvSet(search.endpoints),
    [search.endpoints]
  );

  const availableRegionIds = React.useMemo(
    () => new Set((regionsWithAssignedEndpoints ?? []).map((r) => r.id)),
    [regionsWithAssignedEndpoints]
  );

  const normalizeSearchParams = React.useCallback(
    (
      regionIdsFilter: null | Set<string>,
      endpointsFilter: null | Set<string>
    ) => {
      if (!objectStorageEndpoints) {
        return;
      }

      const newRegionIdsFilter = filterSet(regionIdsFilter, availableRegionIds);

      const endpointsInAllowedRegions = objectStorageEndpoints.filter(
        (endpoint) =>
          newRegionIdsFilter === null || newRegionIdsFilter.has(endpoint.region)
      );

      const availableEndpoints = toStringSet(
        endpointsInAllowedRegions,
        (endpoint) => endpoint.s3_endpoint
      );

      const newEndpointsFilter = filterSet(endpointsFilter, availableEndpoints);

      const regions = toSortedCsv(newRegionIdsFilter);
      const endpoints = toSortedCsv(newEndpointsFilter);

      if (regions === search.regions && endpoints === search.endpoints) {
        return;
      }

      navigate({ search: { regions, endpoints }, replace: true });
    },
    [
      availableRegionIds,
      navigate,
      search.endpoints,
      search.regions,
      objectStorageEndpoints,
    ]
  );

  React.useEffect(() => {
    onFiltersChange?.({ endpointsFilter, regionIdsFilter });
  }, [endpointsFilter, onFiltersChange, regionIdsFilter]);

  React.useEffect(() => {
    normalizeSearchParams(regionIdsFilter, endpointsFilter);
  }, [normalizeSearchParams, endpointsFilter, regionIdsFilter]);

  const availableEndpointOptions: EndpointMultiselectValue[] = React.useMemo(
    () =>
      (objectStorageEndpoints ?? [])
        .filter((endpoint) => matchesFilter(regionIdsFilter, endpoint.region))
        .map((endpoint) => ({
          label: endpoint.s3_endpoint,
          endpoint,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [objectStorageEndpoints, regionIdsFilter]
  );

  const displayedEndpointOptions: EndpointMultiselectValue[] =
    React.useMemo(() => {
      if (areBucketsLoading) {
        return [];
      }

      // When buckets are loaded, only show endpoints that have buckets.
      const endpointsWithBuckets = new Set<string>();
      for (const query of Object.values(bucketQueriesByRegions ?? {})) {
        const buckets = query?.data;
        if (!Array.isArray(buckets) || buckets.length === 0) {
          continue;
        }
        for (const bucket of buckets) {
          if (bucket?.s3_endpoint) {
            endpointsWithBuckets.add(bucket.s3_endpoint);
          }
        }
      }

      return availableEndpointOptions.filter((option) =>
        endpointsWithBuckets.has(option.label)
      );
    }, [areBucketsLoading, availableEndpointOptions, bucketQueriesByRegions]);

  const selectedRegions = React.useMemo(() => {
    if (!regionIdsFilter) {
      return [];
    }

    return (regionsWithAssignedEndpoints ?? []).filter((region) =>
      regionIdsFilter.has(region.id)
    );
  }, [regionIdsFilter, regionsWithAssignedEndpoints]);

  const setSelectedRegionIds = React.useCallback(
    (regionIds: string[]) => {
      const nextRegionIdsFilter = regionIds.length ? new Set(regionIds) : null;
      // remove endpoint filter values if all regions were deselected.
      const nextEndpointsFilter = regionIds.length ? endpointsFilter : null;
      normalizeSearchParams(nextRegionIdsFilter, nextEndpointsFilter);
    },
    [endpointsFilter, normalizeSearchParams]
  );

  const selectedEndpoints = React.useMemo(() => {
    if (!endpointsFilter) {
      return [];
    }

    return availableEndpointOptions.filter((option) =>
      endpointsFilter.has(option.label)
    );
  }, [availableEndpointOptions, endpointsFilter]);

  const setSelectedEndpoints = React.useCallback(
    (endpoints: EndpointMultiselectValue[]) => {
      const nextEndpointsFilter = endpoints.length
        ? new Set(endpoints.map((endpoint) => endpoint.label))
        : null;

      normalizeSearchParams(regionIdsFilter, nextEndpointsFilter);
    },
    [normalizeSearchParams, regionIdsFilter]
  );

  return (
    <>
      <Typography gutterBottom variant="h3">
        Filter by
      </Typography>

      <Grid
        container
        spacing={3}
        sx={(theme) => ({ marginBottom: theme.spacingFunction(16) })}
      >
        <Grid size={{ sm: 4 }}>
          <RegionMultiSelect
            currentCapability="Object Storage"
            fullWidth
            isGeckoLAEnabled={false}
            noMarginTop
            onChange={setSelectedRegionIds}
            optionsLoading={areFiltersLoading}
            regions={regionMultiselectOptions}
            selectedRegions={selectedRegions}
          />
        </Grid>

        {isObjectStorageGen2Enabled && (
          <Grid size={{ sm: 4 }}>
            <EndpointMultiselect
              onChange={setSelectedEndpoints}
              options={displayedEndpointOptions}
              optionsLoading={areFiltersLoading}
              showLabel={true}
              sx={{ flex: 1 }}
              values={selectedEndpoints}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
};

import { readableBytes } from '@akamai/compute-ui-core/api';
import { CircleProgress, ErrorState, Notice, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useOrderV2 } from 'src/hooks/useOrderV2';

import { useObjectStorageRegions } from '../shared/hooks/useObjectStorageRegions';
import { useObjectStorageRegionsWithAssignedEndpoints } from '../shared/hooks/useObjectStorageRegionsWithAssignedEndpoints';
import {
  filterBucketsByEndpoints,
  getRequiredObjectStorageRegionIds,
} from '../shared/utils/utilities';
import {
  type BucketDeletionDialogRef,
  BucketDeletionDialogWithRef,
} from './DeleteBucket/BucketDeletionDialog';
import { BucketFilters } from './Filters/BucketFilters';
import { useBucketDrawers } from './hooks/useBucketDrawers';
import { useObjectStorageBuckets } from './hooks/useObjectStorageBuckets';
import { BucketTable } from './Table/BucketTable';

import type { ObjectStorageBucket } from '@linode/api-v4';

interface Props {
  isCreateBucketDrawerOpen?: boolean;
}

export const BucketList = ({ isCreateBucketDrawerOpen }: Props) => {
  const { regionsByIdMap } = useObjectStorageRegions();
  const { objectStorageEndpoints, isLoading: areRegionsAndEndpointsLoading } =
    useObjectStorageRegionsWithAssignedEndpoints();

  const { openDrawer } = useBucketDrawers();

  const deletionDialogRef = React.useRef<BucketDeletionDialogRef>(null);

  const [regionIdsFilter, setRegionIdsFilter] = React.useState<
    null | Set<string> | undefined
  >(undefined);

  const [endpointsFilter, setEndpointsFilter] = React.useState<
    null | Set<string> | undefined
  >(undefined);

  const requiredRegionIds = React.useMemo(
    () =>
      getRequiredObjectStorageRegionIds(
        objectStorageEndpoints,
        regionIdsFilter,
        endpointsFilter
      ),
    [objectStorageEndpoints, regionIdsFilter, endpointsFilter]
  );

  // Don't retry on mount because we don't want to trigger refetching of buckets
  // when the user is interacting with the filters.
  const {
    data: buckets,
    failedRegionIds,
    isLoading: areBucketsLoading,
    bucketFetchFailedForAllRegions,
  } = useObjectStorageBuckets({
    regionIds: requiredRegionIds,
    retryOnMount: false,
  });

  const handleFiltersChange = React.useCallback(
    ({
      endpointsFilter,
      regionIdsFilter,
    }: {
      endpointsFilter: null | Set<string>;
      regionIdsFilter: null | Set<string>;
    }) => {
      setRegionIdsFilter(regionIdsFilter);
      setEndpointsFilter(endpointsFilter);
    },
    []
  );

  const handleClickDetails = React.useCallback(
    (bucket: ObjectStorageBucket) =>
      openDrawer('bucket-details', bucket.region, bucket.label),
    [openDrawer]
  );

  const handleClickRemove = React.useCallback(
    (bucket: ObjectStorageBucket) => deletionDialogRef.current?.open(bucket),
    []
  );

  const [filteredBuckets, setFilteredBuckets] = React.useState<
    ObjectStorageBucket[]
  >([]);

  React.useEffect(() => {
    if (!areBucketsLoading) {
      setFilteredBuckets(filterBucketsByEndpoints(buckets, endpointsFilter));
    }
  }, [areBucketsLoading, buckets, endpointsFilter]);

  const {
    handleOrderChange,
    order,
    orderBy,
    sortedData: orderedBuckets,
  } = useOrderV2({
    data: filteredBuckets,
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'label',
      },
      from: '/object-storage/buckets',
    },
    preferenceKey: 'object-storage-buckets',
  });

  const {
    failedRegionIds: allFailedRegionIds,
    isLoading: areAllBucketsLoading,
  } = useObjectStorageBuckets({ retryOnMount: false });
  const unavailableRegionLabels = React.useMemo(() => {
    if (areBucketsLoading) {
      return [];
    }

    // show failed regions as soon as the filtered buckets have finished loading;
    // show all failed regions when all buckets have finished loading
    const regionIds =
      (areAllBucketsLoading ? failedRegionIds : allFailedRegionIds) ?? [];
    return regionIds
      .map((regionId) => regionsByIdMap?.[regionId]?.label)
      .filter((label): label is string => Boolean(label));
  }, [
    areBucketsLoading,
    areAllBucketsLoading,
    failedRegionIds,
    allFailedRegionIds,
    regionsByIdMap,
  ]);

  const totalUsage = React.useMemo(
    () => filteredBuckets.reduce((acc, b) => acc + b.size, 0),
    [filteredBuckets]
  );

  if (bucketFetchFailedForAllRegions) {
    return (
      <ErrorState
        data-qa-error-state
        errorText="There was an error retrieving your buckets. Please reload and try again."
      />
    );
  }

  if (areRegionsAndEndpointsLoading) {
    return <CircleProgress />;
  }

  return (
    <>
      <DocumentTitleSegment
        segment={`${isCreateBucketDrawerOpen ? 'Create a Bucket' : 'Buckets'}`}
      />

      {unavailableRegionLabels.length > 0 && (
        <UnavailableRegionsDisplay regionLabels={unavailableRegionLabels} />
      )}

      <BucketFilters onFiltersChange={handleFiltersChange} />

      <Grid size={12}>
        <BucketTable
          data={orderedBuckets ?? []}
          handleClickDetails={handleClickDetails}
          handleClickRemove={handleClickRemove}
          handleOrderChange={handleOrderChange}
          loading={areBucketsLoading || !requiredRegionIds}
          order={order}
          orderBy={orderBy}
        />
        {/* If there's more than one Bucket, display the total usage. */}
        {filteredBuckets.length > 1 ? (
          <Typography
            style={{ marginTop: 18, textAlign: 'center', width: '100%' }}
            variant="body1"
          >
            Total storage used: {readableBytes(totalUsage).formatted}
          </Typography>
        ) : null}
      </Grid>

      <BucketDeletionDialogWithRef ref={deletionDialogRef} />
    </>
  );
};

interface UnavailableRegionLabelsProps {
  regionLabels: string[];
}

const UnavailableRegionsDisplay = React.memo(
  ({ regionLabels }: UnavailableRegionLabelsProps) => {
    return <Banner regionsAffected={regionLabels} />;
  }
);

interface BannerProps {
  regionsAffected: string[];
}

const Banner = React.memo(({ regionsAffected }: BannerProps) => {
  const moreThanOneRegionAffected = regionsAffected.length > 1;

  return (
    <Notice variant="warning">
      <Typography component="div" style={{ fontSize: '1rem' }}>
        There was an error loading buckets in{' '}
        {moreThanOneRegionAffected
          ? 'the following regions:'
          : `${regionsAffected[0]}.`}
        <ul>
          {moreThanOneRegionAffected &&
            regionsAffected.map((thisRegion) => (
              <li key={thisRegion}>{thisRegion}</li>
            ))}
        </ul>
        If you have buckets in{' '}
        {moreThanOneRegionAffected ? 'these regions' : regionsAffected[0]}, you
        may not see them listed below.
      </Typography>
    </Notice>
  );
});

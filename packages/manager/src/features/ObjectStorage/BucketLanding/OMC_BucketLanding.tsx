import { CircleProgress, ErrorState, Notice, Typography } from '@linode/ui';
import { readableBytes } from '@linode/utilities';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import OrderBy from 'src/components/OrderBy';
import { TransferDisplay } from 'src/components/TransferDisplay/TransferDisplay';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useObjectStorageRegions } from 'src/features/ObjectStorage/hooks/useObjectStorageRegions';
import { useOpenClose } from 'src/hooks/useOpenClose';
import {
  useDeleteBucketWithRegionMutation,
  useObjectStorageBuckets,
} from 'src/queries/object-storage/queries';
import { useProfile } from '@linode/queries';
import {
  sendDeleteBucketEvent,
  sendDeleteBucketFailedEvent,
} from 'src/utilities/analytics/customEventAnalytics';

import { CancelNotice } from '../CancelNotice';
import { BucketDetailsDrawer } from './BucketDetailsDrawer';
import { BucketLandingEmptyState } from './BucketLandingEmptyState';
import { BucketTable } from './BucketTable';

import type { APIError, ObjectStorageBucket } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

interface Props {
  isCreateBucketDrawerOpen?: boolean;
}

const useStyles = makeStyles()((theme: Theme) => ({
  copy: {
    marginTop: theme.spacing(),
  },
}));

export const OMC_BucketLanding = (props: Props) => {
  const { isCreateBucketDrawerOpen } = props;
  const { data: profile } = useProfile();
  const { availableStorageRegions } = useObjectStorageRegions();

  const isRestrictedUser = profile?.restricted;

  const {
    data: objectStorageBucketsResponse,
    error: bucketsErrors,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets();

  const { mutateAsync: deleteBucket } = useDeleteBucketWithRegionMutation();

  const { classes } = useStyles();

  const removeBucketConfirmationDialog = useOpenClose();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<APIError[] | undefined>(undefined);
  const [
    bucketDetailDrawerOpen,
    setBucketDetailDrawerOpen,
  ] = React.useState<boolean>(false);

  const [selectedBucket, setSelectedBucket] = React.useState<
    ObjectStorageBucket | undefined
  >(undefined);

  const handleClickDetails = (bucket: ObjectStorageBucket) => {
    setBucketDetailDrawerOpen(true);
    setSelectedBucket(bucket);
  };

  const closeBucketDetailDrawer = () => {
    setBucketDetailDrawerOpen(false);
  };

  const handleClickRemove = (bucket: ObjectStorageBucket) => {
    setSelectedBucket(bucket);
    setError(undefined);
    removeBucketConfirmationDialog.open();
  };

  const removeBucket = async () => {
    // This shouldn't happen, but just in case (and to get TS to quit complaining...)
    if (!selectedBucket) {
      return;
    }

    setError(undefined);
    setIsLoading(true);

    const { label, region } = selectedBucket;

    if (region) {
      try {
        await deleteBucket({ label, region });
        removeBucketConfirmationDialog.close();
        setIsLoading(false);
        sendDeleteBucketEvent(region);
      } catch (e) {
        sendDeleteBucketFailedEvent(region);
        setIsLoading(false);
        setError(e);
      }
    }
  };

  const closeRemoveBucketConfirmationDialog = React.useCallback(() => {
    removeBucketConfirmationDialog.close();
  }, [removeBucketConfirmationDialog]);

  // @TODO OBJGen2 - We could clean this up when OBJ Gen2 is in GA.
  const unavailableRegionLabels = React.useMemo(() => {
    const errors = objectStorageBucketsResponse?.errors;

    if (!errors) {
      return [];
    }

    // Using a Map to store unique region-label pairs
    // In our case, this handles deduplication automatically
    const regionMap = new Map<string, string>();

    // Single pass through errors to collect all region labels
    errors.forEach((error) => {
      if ('endpoint' in error && error.endpoint) {
        const regionLabel = availableStorageRegions?.find(
          (region) => region.id === error.endpoint.region
        )?.label;

        if (regionLabel) {
          regionMap.set(error.endpoint.region, regionLabel);
        }
      } else if ('region' in error && error.region?.label) {
        regionMap.set(error.region.label, error.region.label);
      }
    });

    return Array.from(regionMap.values());
  }, [objectStorageBucketsResponse, availableStorageRegions]);

  if (isRestrictedUser) {
    return <RenderEmpty />;
  }

  if (bucketsErrors) {
    return (
      <ErrorState
        data-qa-error-state
        errorText="There was an error retrieving your buckets. Please reload and try again."
      />
    );
  }

  if (areBucketsLoading || objectStorageBucketsResponse === undefined) {
    return <CircleProgress />;
  }

  if (objectStorageBucketsResponse?.buckets.length === 0) {
    return (
      <>
        {unavailableRegionLabels && unavailableRegionLabels.length > 0 && (
          <UnavailableRegionsDisplay regionLabels={unavailableRegionLabels} />
        )}
        <RenderEmpty />
      </>
    );
  }

  const buckets = objectStorageBucketsResponse.buckets;
  const totalUsage = sumBucketUsage(buckets);
  const bucketLabel = selectedBucket ? selectedBucket.label : '';

  return (
    <React.Fragment>
      <DocumentTitleSegment
        segment={`${isCreateBucketDrawerOpen ? 'Create a Bucket' : 'Buckets'}`}
      />
      {unavailableRegionLabels && unavailableRegionLabels.length > 0 && (
        <UnavailableRegionsDisplay regionLabels={unavailableRegionLabels} />
      )}
      <Grid size={12}>
        <OrderBy data={buckets} order={'asc'} orderBy={'label'}>
          {({ data: orderedData, handleOrderChange, order, orderBy }) => {
            const bucketTableProps = {
              data: orderedData,
              handleClickDetails,
              handleClickRemove,
              handleOrderChange,
              order,
              orderBy,
            };
            return <BucketTable {...bucketTableProps} />;
          }}
        </OrderBy>
        {/* If there's more than one Bucket, display the total usage. */}
        {buckets.length > 1 ? (
          <Typography
            style={{ marginTop: 18, textAlign: 'center', width: '100%' }}
            variant="body1"
          >
            Total storage used:{' '}
            {/* to convert from binary units (GiB) to decimal units (GB) we need to pass the base10 flag */}
            {readableBytes(totalUsage, { base10: true }).formatted}
          </Typography>
        ) : null}
        <TransferDisplay spacingTop={buckets.length > 1 ? 8 : 18} />
      </Grid>
      <TypeToConfirmDialog
        entity={{
          action: 'deletion',
          name: bucketLabel,
          primaryBtnText: 'Delete',
          type: 'Bucket',
        }}
        errors={error}
        expand
        label={'Bucket Name'}
        loading={isLoading}
        onClick={removeBucket}
        onClose={closeRemoveBucketConfirmationDialog}
        open={removeBucketConfirmationDialog.isOpen}
        title={`Delete Bucket ${bucketLabel}`}
        typographyStyle={{ marginTop: '20px' }}
      >
        <Notice variant="warning">
          <Typography style={{ fontSize: '0.875rem' }}>
            <strong>Warning:</strong> Deleting a bucket is permanent and
            can&rsquo;t be undone.
          </Typography>
        </Notice>
        <Typography className={classes.copy}>
          A bucket must be empty before deleting it. Please{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/lifecycle-policies">
            delete all objects
          </Link>
          , or use{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-object-storage#object-storage-tools">
            another tool
          </Link>{' '}
          to force deletion.
        </Typography>
        {/* If the user is attempting to delete their last Bucket, remind them
          that they will still be billed unless they cancel Object Storage in
          Account Settings. */}
        {buckets.length === 1 && <CancelNotice className={classes.copy} />}
      </TypeToConfirmDialog>
      <BucketDetailsDrawer
        onClose={closeBucketDetailDrawer}
        open={bucketDetailDrawerOpen}
        selectedBucket={selectedBucket}
      />
    </React.Fragment>
  );
};

const RenderEmpty = () => {
  return <BucketLandingEmptyState />;
};

interface UnavailableRegionLabelsProps {
  regionLabels: string[];
}

const UnavailableRegionsDisplay = React.memo(
  ({ regionLabels }: UnavailableRegionLabelsProps) => {
    const regionsAffected = regionLabels.map(
      (unavailableRegion) => unavailableRegion
    );

    return <Banner regionsAffected={regionsAffected} />;
  }
);

interface BannerProps {
  regionsAffected: string[];
}

const Banner = React.memo(({ regionsAffected }: BannerProps) => {
  const moreThanOneRegionAffected = regionsAffected.length > 1;

  return (
    <Notice important variant="warning">
      <Typography component="div" style={{ fontSize: '1rem' }}>
        There was an error loading buckets in{' '}
        {moreThanOneRegionAffected
          ? 'the following regions:'
          : `${regionsAffected[0]}.`}
        <ul>
          {moreThanOneRegionAffected &&
            regionsAffected.map((thisRegion, idx) => (
              <li key={`${thisRegion}-${idx}`}>{thisRegion}</li>
            ))}
        </ul>
        If you have buckets in{' '}
        {moreThanOneRegionAffected ? 'these regions' : regionsAffected[0]}, you
        may not see them listed below.
      </Typography>
    </Notice>
  );
});

export const sumBucketUsage = (buckets: ObjectStorageBucket[]) => {
  return buckets.reduce((acc, thisBucket) => {
    acc += thisBucket.size;
    return acc;
  }, 0);
};

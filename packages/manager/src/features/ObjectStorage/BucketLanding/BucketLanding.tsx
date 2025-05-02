import { useProfile, useRegionsQuery } from '@linode/queries';
import { CircleProgress, ErrorState, Notice, Typography } from '@linode/ui';
import { readableBytes, useOpenClose } from '@linode/utilities';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { TransferDisplay } from 'src/components/TransferDisplay/TransferDisplay';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import {
  useDeleteBucketMutation,
  useObjectStorageBuckets,
} from 'src/queries/object-storage/queries';
import { isBucketError } from 'src/queries/object-storage/requests';
import {
  sendDeleteBucketEvent,
  sendDeleteBucketFailedEvent,
} from 'src/utilities/analytics/customEventAnalytics';

import { CancelNotice } from '../CancelNotice';
import { BucketDetailsDrawer } from './BucketDetailsDrawer';
import { BucketLandingEmptyState } from './BucketLandingEmptyState';
import { BucketTable } from './BucketTable';

import type {
  APIError,
  ObjectStorageBucket,
  ObjectStorageCluster,
  ObjectStorageEndpoint,
} from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

interface Props {
  isCreateBucketDrawerOpen?: boolean;
}

const useStyles = makeStyles()((theme: Theme) => ({
  copy: {
    marginTop: theme.spacing(),
  },
}));

export const BucketLanding = (props: Props) => {
  const { isCreateBucketDrawerOpen } = props;
  const { data: profile } = useProfile();

  const isRestrictedUser = profile?.restricted;

  const {
    data: objectStorageBucketsResponse,
    error: bucketsErrors,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets();

  const { mutateAsync: deleteBucket } = useDeleteBucketMutation();

  const { classes } = useStyles();

  const removeBucketConfirmationDialog = useOpenClose();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<APIError[] | undefined>(undefined);
  const [bucketDetailDrawerOpen, setBucketDetailDrawerOpen] =
    React.useState<boolean>(false);
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

  const removeBucket = () => {
    // This shouldn't happen, but just in case (and to get TS to quit complaining...)
    if (!selectedBucket) {
      return;
    }

    setError(undefined);
    setIsLoading(true);

    const { cluster, label } = selectedBucket;

    deleteBucket({ cluster, label })
      .then(() => {
        removeBucketConfirmationDialog.close();
        setIsLoading(false);

        // @analytics
        sendDeleteBucketEvent(cluster);
      })
      .catch((e) => {
        // @analytics
        sendDeleteBucketFailedEvent(cluster);

        setIsLoading(false);
        setError(e);
      });
  };

  const {
    handleOrderChange,
    order,
    orderBy,
    sortedData: orderedData,
  } = useOrderV2({
    data: objectStorageBucketsResponse?.buckets,
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'label',
      },
      from: '/object-storage/buckets',
    },
    preferenceKey: 'object-storage-buckets',
  });

  const closeRemoveBucketConfirmationDialog = React.useCallback(() => {
    removeBucketConfirmationDialog.close();
  }, [removeBucketConfirmationDialog]);

  const unavailableClusters =
    objectStorageBucketsResponse?.errors.map((error) =>
      isBucketError(error) ? error.cluster : error.endpoint
    ) || [];

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
        {unavailableClusters.length > 0 && (
          <UnavailableClustersDisplay
            unavailableClusters={unavailableClusters}
          />
        )}
        <RenderEmpty />
      </>
    );
  }

  const totalUsage = sumBucketUsage(objectStorageBucketsResponse.buckets);
  const bucketLabel = selectedBucket ? selectedBucket.label : '';

  return (
    <React.Fragment>
      <DocumentTitleSegment
        segment={`${isCreateBucketDrawerOpen ? 'Create a Bucket' : 'Buckets'}`}
      />
      {unavailableClusters.length > 0 && (
        <UnavailableClustersDisplay unavailableClusters={unavailableClusters} />
      )}
      <Grid size={12}>
        <BucketTable
          data={orderedData ?? []}
          handleClickDetails={handleClickDetails}
          handleClickRemove={handleClickRemove}
          handleOrderChange={handleOrderChange}
          order={order}
          orderBy={orderBy}
        />
        {/* If there's more than one Bucket, display the total usage. */}
        {objectStorageBucketsResponse.buckets.length > 1 ? (
          <Typography
            style={{ marginTop: 18, textAlign: 'center', width: '100%' }}
            variant="body1"
          >
            Total storage used: {readableBytes(totalUsage).formatted}
          </Typography>
        ) : null}
        <TransferDisplay
          spacingTop={objectStorageBucketsResponse.buckets.length > 1 ? 8 : 18}
        />
      </Grid>
      <TypeToConfirmDialog
        entity={{
          action: 'deletion',
          name: bucketLabel,
          primaryBtnText: 'Delete',
          type: 'Bucket',
        }}
        errors={error}
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
        {objectStorageBucketsResponse?.buckets.length === 1 && (
          <CancelNotice className={classes.copy} />
        )}
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

interface UnavailableClustersDisplayProps {
  unavailableClusters: (ObjectStorageCluster | ObjectStorageEndpoint)[];
}

const UnavailableClustersDisplay = React.memo(
  ({ unavailableClusters }: UnavailableClustersDisplayProps) => {
    const { data: regions } = useRegionsQuery();

    const regionsAffected = unavailableClusters.map(
      (cluster) =>
        regions?.find((region) => region.id === cluster.region)?.label ??
        cluster.region
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

export const sumBucketUsage = (buckets: ObjectStorageBucket[]) => {
  return buckets.reduce((acc, thisBucket) => {
    acc += thisBucket.size;
    return acc;
  }, 0);
};

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import OrderBy from 'src/components/OrderBy';
import Typography from 'src/components/core/Typography';
import useOpenClose from 'src/hooks/useOpenClose';
import { APIError } from '@linode/api-v4/lib/types';
import { BucketDetailsDrawer } from './BucketDetailsDrawer';
import { BucketLandingEmptyState } from './BucketLandingEmptyState';
import { BucketTable } from './BucketTable';
import { CancelNotice } from '../CancelNotice';
import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { makeStyles } from 'tss-react/mui';
import { Notice } from 'src/components/Notice/Notice';
import { readableBytes } from 'src/utilities/unitConversions';
import { Theme } from '@mui/material/styles';
import { TransferDisplay } from 'src/components/TransferDisplay/TransferDisplay';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import {
  BucketError,
  useDeleteBucketMutation,
  useObjectStorageBuckets,
  useObjectStorageClusters,
} from 'src/queries/objectStorage';
import {
  ObjectStorageBucket,
  ObjectStorageCluster,
} from '@linode/api-v4/lib/object-storage';
import {
  sendDeleteBucketEvent,
  sendDeleteBucketFailedEvent,
} from 'src/utilities/analytics';

const useStyles = makeStyles()((theme: Theme) => ({
  copy: {
    marginTop: theme.spacing(),
  },
}));

export const BucketLanding = () => {
  const { data: profile } = useProfile();

  const isRestrictedUser = profile?.restricted;

  const {
    data: objectStorageClusters,
    isLoading: areClustersLoading,
    error: clustersErrors,
  } = useObjectStorageClusters();

  const {
    data: objectStorageBucketsResponse,
    isLoading: areBucketsLoading,
    error: bucketsErrors,
  } = useObjectStorageBuckets(objectStorageClusters);

  const { mutateAsync: deleteBucket } = useDeleteBucketMutation();

  const { classes } = useStyles();

  const removeBucketConfirmationDialog = useOpenClose();
  const [bucketToRemove, setBucketToRemove] = React.useState<
    ObjectStorageBucket | undefined
  >(undefined);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<APIError[] | undefined>(undefined);
  const [
    bucketDetailDrawerOpen,
    setBucketDetailDrawerOpen,
  ] = React.useState<boolean>(false);
  const [bucketForDetails, setBucketForDetails] = React.useState<
    ObjectStorageBucket | undefined
  >(undefined);

  const handleClickDetails = (bucket: ObjectStorageBucket) => {
    setBucketDetailDrawerOpen(true);
    setBucketForDetails(bucket);
  };

  const closeBucketDetailDrawer = () => {
    setBucketDetailDrawerOpen(false);
  };

  const handleClickRemove = (bucket: ObjectStorageBucket) => {
    setBucketToRemove(bucket);
    setError(undefined);
    removeBucketConfirmationDialog.open();
  };

  const removeBucket = () => {
    // This shouldn't happen, but just in case (and to get TS to quit complaining...)
    if (!bucketToRemove) {
      return;
    }

    setError(undefined);
    setIsLoading(true);

    const { cluster, label } = bucketToRemove;

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

  const closeRemoveBucketConfirmationDialog = React.useCallback(() => {
    removeBucketConfirmationDialog.close();
  }, [removeBucketConfirmationDialog]);

  const unavailableClusters =
    objectStorageBucketsResponse?.errors.map(
      (error: BucketError) => error.cluster
    ) || [];

  if (isRestrictedUser) {
    return <RenderEmpty />;
  }

  if (clustersErrors || bucketsErrors) {
    return (
      <ErrorState
        data-qa-error-state
        errorText="There was an error retrieving your buckets. Please reload and try again."
      />
    );
  }

  if (
    areClustersLoading ||
    areBucketsLoading ||
    objectStorageBucketsResponse === undefined
  ) {
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
  const bucketLabel = bucketToRemove ? bucketToRemove.label : '';

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Buckets" />
      {unavailableClusters.length > 0 && (
        <UnavailableClustersDisplay unavailableClusters={unavailableClusters} />
      )}
      <Grid xs={12}>
        <OrderBy
          data={objectStorageBucketsResponse.buckets}
          order={'asc'}
          orderBy={'label'}
        >
          {({ data: orderedData, handleOrderChange, order, orderBy }) => {
            const bucketTableProps = {
              orderBy,
              order,
              handleOrderChange,
              handleClickRemove,
              handleClickDetails,
              data: orderedData,
            };
            return <BucketTable {...bucketTableProps} />;
          }}
        </OrderBy>
        {/* If there's more than one Bucket, display the total usage. */}
        {objectStorageBucketsResponse.buckets.length > 1 ? (
          <Typography
            style={{ marginTop: 18, width: '100%', textAlign: 'center' }}
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
        title={`Delete Bucket ${bucketLabel}`}
        entity={{
          type: 'Bucket',
          label: bucketLabel,
        }}
        open={removeBucketConfirmationDialog.isOpen}
        loading={isLoading}
        errors={error}
        onClose={closeRemoveBucketConfirmationDialog}
        onClick={removeBucket}
        typographyStyle={{ marginTop: '20px' }}
      >
        <Notice warning>
          <Typography style={{ fontSize: '0.875rem' }}>
            <strong>Warning:</strong> Deleting a bucket is permanent and
            can&rsquo;t be undone.
          </Typography>
        </Notice>
        <Typography className={classes.copy}>
          A bucket must be empty before deleting it. Please{' '}
          <a
            href="https://www.linode.com/docs/platform/object-storage/lifecycle-policies/"
            target="_blank"
            aria-describedby="external-site"
            rel="noopener noreferrer"
          >
            delete all objects
          </a>
          , or use{' '}
          <a
            href="https://www.linode.com/docs/platform/object-storage/how-to-use-object-storage/#object-storage-tools"
            target="_blank"
            aria-describedby="external-site"
            rel="noopener noreferrer"
          >
            another tool
          </a>{' '}
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
        open={bucketDetailDrawerOpen}
        onClose={closeBucketDetailDrawer}
        bucketLabel={bucketForDetails?.label}
        hostname={bucketForDetails?.hostname}
        created={bucketForDetails?.created}
        cluster={bucketForDetails?.cluster}
        size={bucketForDetails?.size}
        objectsNumber={bucketForDetails?.objects}
      />
    </React.Fragment>
  );
};

const RenderEmpty = () => {
  return <BucketLandingEmptyState />;
};

interface UnavailableClustersDisplayProps {
  unavailableClusters: ObjectStorageCluster[];
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
    <Notice warning important>
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

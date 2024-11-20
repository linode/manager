import { CircleProgress, Notice } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Link } from 'src/components/Link';
import OrderBy from 'src/components/OrderBy';
import { TransferDisplay } from 'src/components/TransferDisplay/TransferDisplay';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { useOpenClose } from 'src/hooks/useOpenClose';
import {
  useDeleteBucketWithRegionMutation,
  useObjectStorageBuckets,
} from 'src/queries/object-storage/queries';
import { isBucketError } from 'src/queries/object-storage/requests';
import { useProfile } from 'src/queries/profile/profile';
import {
  sendDeleteBucketEvent,
  sendDeleteBucketFailedEvent,
} from 'src/utilities/analytics/customEventAnalytics';
import { readableBytes } from 'src/utilities/unitConversions';

import { CancelNotice } from '../CancelNotice';
import { BucketDetailsDrawer } from './BucketDetailsDrawer';
import { BucketLandingEmptyState } from './BucketLandingEmptyState';
import { BucketTable } from './BucketTable';

import type { APIError, ObjectStorageBucket, Region } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  copy: {
    marginTop: theme.spacing(),
  },
}));

export const OMC_BucketLanding = () => {
  const { data: profile } = useProfile();

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
  const unavailableRegions = objectStorageBucketsResponse?.errors
    ?.map((error) => (isBucketError(error) ? error.region : error.endpoint))
    .filter((region): region is Region => region !== undefined);

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
        {unavailableRegions && unavailableRegions.length > 0 && (
          <UnavailableRegionsDisplay unavailableRegions={unavailableRegions} />
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
      <DocumentTitleSegment segment="Buckets" />
      {unavailableRegions && unavailableRegions.length > 0 && (
        <UnavailableRegionsDisplay unavailableRegions={unavailableRegions} />
      )}
      <Grid xs={12}>
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

interface UnavailableRegionsDisplayProps {
  unavailableRegions: Region[];
}

const UnavailableRegionsDisplay = React.memo(
  ({ unavailableRegions }: UnavailableRegionsDisplayProps) => {
    const regionsAffected = unavailableRegions.map(
      (unavailableRegion) => unavailableRegion.label
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

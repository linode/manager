import { Region } from '@linode/api-v4';
import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import OrderBy from 'src/components/OrderBy';
import { TransferDisplay } from 'src/components/TransferDisplay/TransferDisplay';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { useOpenClose } from 'src/hooks/useOpenClose';
import {
  BucketError,
  useDeleteBucketWithRegionMutation,
  useObjectStorageBuckets,
} from 'src/queries/objectStorage';
import { useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import {
  sendDeleteBucketEvent,
  sendDeleteBucketFailedEvent,
} from 'src/utilities/analytics';
import { getRegionsByRegionId } from 'src/utilities/regions';
import { readableBytes } from 'src/utilities/unitConversions';

import { CancelNotice } from '../CancelNotice';
import { BucketDetailsDrawer } from './BucketDetailsDrawer';
import { BucketLandingEmptyState } from './BucketLandingEmptyState';
import { BucketTable } from './BucketTable';

const useStyles = makeStyles()((theme: Theme) => ({
  copy: {
    marginTop: theme.spacing(),
  },
}));

export const OMC_BucketLanding = () => {
  const { data: profile } = useProfile();

  const isRestrictedUser = profile?.restricted;

  const { account } = useAccountManagement();
  const flags = useFlags();

  const isObjMultiClusterEnabled = isFeatureEnabled(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  const {
    data: regions,
    error: regionErrors,
    isLoading: areRegionsLoading,
  } = useRegionsQuery();

  const regionsLookup = regions && getRegionsByRegionId(regions);

  const regionsSupportingObjectStorage = regions?.filter((region) =>
    region.capabilities.includes('Object Storage')
  );

  const {
    data: objectStorageBucketsResponse,
    error: bucketsErrors,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets({
    isObjMultiClusterEnabled,
    regions: regionsSupportingObjectStorage,
  });

  const { mutateAsync: deleteBucket } = useDeleteBucketWithRegionMutation();

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

  const removeBucket = async () => {
    // This shouldn't happen, but just in case (and to get TS to quit complaining...)
    if (!bucketToRemove) {
      return;
    }

    setError(undefined);
    setIsLoading(true);

    const { label, region } = bucketToRemove;
    if (region) {
      try {
        await deleteBucket({ label, region });
        removeBucketConfirmationDialog.close();
        setIsLoading(false);

        // @analytics
        sendDeleteBucketEvent(region);
      } catch (e) {
        // @analytics
        sendDeleteBucketFailedEvent(region);

        setIsLoading(false);
        setError(e);
      }
    }
  };

  const closeRemoveBucketConfirmationDialog = React.useCallback(() => {
    removeBucketConfirmationDialog.close();
  }, [removeBucketConfirmationDialog]);

  // @TODO OBJ Multicluster - region is defined as an optional field in BucketError. Once the feature is rolled out to production, we could clean this up and remove the filter.
  const unavailableRegions = objectStorageBucketsResponse?.errors
    ?.map((error: BucketError) => error.region)
    .filter((region): region is Region => region !== undefined);

  if (isRestrictedUser) {
    return <RenderEmpty />;
  }

  if (regionErrors || bucketsErrors) {
    return (
      <ErrorState
        data-qa-error-state
        errorText="There was an error retrieving your buckets. Please reload and try again."
      />
    );
  }

  if (
    areRegionsLoading ||
    areBucketsLoading ||
    objectStorageBucketsResponse === undefined
  ) {
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

  const totalUsage = sumBucketUsage(objectStorageBucketsResponse.buckets);
  const bucketLabel = bucketToRemove ? bucketToRemove.label : '';

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Buckets" />
      {unavailableRegions && unavailableRegions.length > 0 && (
        <UnavailableRegionsDisplay unavailableRegions={unavailableRegions} />
      )}
      <Grid xs={12}>
        <OrderBy
          data={objectStorageBucketsResponse.buckets}
          order={'asc'}
          orderBy={'label'}
        >
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
          <Link to="https://www.linode.com/docs/platform/object-storage/lifecycle-policies/">
            delete all objects
          </Link>
          , or use{' '}
          <Link to="https://www.linode.com/docs/platform/object-storage/how-to-use-object-storage/#object-storage-tools">
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
        bucketLabel={bucketForDetails?.label}
        bucketRegion={regionsLookup?.[bucketForDetails?.region ?? '']}
        cluster={bucketForDetails?.cluster}
        created={bucketForDetails?.created}
        hostname={bucketForDetails?.hostname}
        objectsNumber={bucketForDetails?.objects}
        onClose={closeBucketDetailDrawer}
        open={bucketDetailDrawerOpen}
        size={bucketForDetails?.size}
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

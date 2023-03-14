import {
  ObjectStorageBucket,
  ObjectStorageCluster,
} from '@linode/api-v4/lib/object-storage';
import { APIError } from '@linode/api-v4/lib/types';
import classNames from 'classnames';
import * as React from 'react';
import { compose } from 'recompose';
import BucketIcon from 'src/assets/icons/entityIcons/bucket.svg';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import OrderBy from 'src/components/OrderBy';
import Placeholder from 'src/components/Placeholder';
import TransferDisplay from 'src/components/TransferDisplay';
import TypeToConfirmDialog from 'src/components/TypeToConfirmDialog';
import { objectStorageClusterDisplay } from 'src/constants';
import bucketDrawerContainer, {
  DispatchProps,
} from 'src/containers/bucketDrawer.container';
import useOpenClose from 'src/hooks/useOpenClose';
import {
  BucketError,
  useDeleteBucketMutation,
  useObjectStorageBuckets,
  useObjectStorageClusters,
} from 'src/queries/objectStorage';
import {
  sendDeleteBucketEvent,
  sendDeleteBucketFailedEvent,
  sendObjectStorageDocsEvent,
} from 'src/utilities/ga';
import { readableBytes } from 'src/utilities/unitConversions';
import CancelNotice from '../CancelNotice';
import BucketDetailsDrawer from './BucketDetailsDrawer';
import BucketTable from './BucketTable';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    marginTop: theme.spacing(),
  },
  empty: {
    '& svg': {
      marginTop: theme.spacing(1.5),
      transform: 'scale(0.8)',
    },
  },
  placeholderAdjustment: {
    padding: `${theme.spacing(2)} 0 0 0`,
    [theme.breakpoints.up('md')]: {
      padding: `${theme.spacing(10)} 0 0 0`,
    },
  },
}));

interface Props {
  isRestrictedUser: boolean;
}

export type CombinedProps = Props & DispatchProps;

export const BucketLanding: React.FC<CombinedProps> = (props) => {
  const { isRestrictedUser, openBucketDrawer } = props;

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

  const classes = useStyles();

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
    return <RenderEmpty onClick={openBucketDrawer} />;
  }

  if (clustersErrors || bucketsErrors) {
    return <RenderError data-qa-error-state />;
  }

  if (
    areClustersLoading ||
    areBucketsLoading ||
    objectStorageBucketsResponse === undefined
  ) {
    return <RenderLoading />;
  }

  if (objectStorageBucketsResponse?.buckets.length === 0) {
    return (
      <>
        {unavailableClusters.length > 0 && (
          <UnavailableClustersDisplay
            unavailableClusters={unavailableClusters}
          />
        )}
        <RenderEmpty onClick={openBucketDrawer} />
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
      <Grid item xs={12}>
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
              openBucketDrawer,
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

const RenderLoading: React.FC<{}> = () => {
  return <CircleProgress />;
};

const RenderError: React.FC<{}> = () => {
  return (
    <ErrorState errorText="There was an error retrieving your buckets. Please reload and try again." />
  );
};

const RenderEmpty: React.FC<{
  onClick: () => void;
}> = (props) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Buckets" />
      <Placeholder
        title="Object Storage"
        className={classNames({
          [classes.empty]: true,
          [classes.placeholderAdjustment]: true,
        })}
        isEntity
        icon={BucketIcon}
        renderAsSecondary
        buttonProps={[
          {
            onClick: props.onClick,
            children: 'Create Bucket',
          },
        ]}
        showTransferDisplay
      >
        <Typography variant="subtitle1">Need help getting started?</Typography>
        <Typography variant="subtitle1">
          <a
            onClick={() => sendObjectStorageDocsEvent('Empty state')}
            href="https://linode.com/docs/platform/object-storage"
            target="_blank"
            aria-describedby="external-site"
            rel="noopener noreferrer"
            className="h-u"
          >
            Learn more about storage options for your multimedia, archives, and
            data backups here.
          </a>
        </Typography>
      </Placeholder>
    </React.Fragment>
  );
};

const enhanced = compose<CombinedProps, Props>(
  React.memo,
  bucketDrawerContainer
);

export default enhanced(BucketLanding);

interface UnavailableClustersDisplayProps {
  unavailableClusters: ObjectStorageCluster[];
}

const UnavailableClustersDisplay: React.FC<UnavailableClustersDisplayProps> = React.memo(
  ({ unavailableClusters }) => {
    return (
      <Banner
        regionsAffected={unavailableClusters.map(
          (cluster) => objectStorageClusterDisplay[cluster.id] || cluster.region
        )}
      />
    );
  }
);

interface BannerProps {
  regionsAffected: string[];
}

const Banner: React.FC<BannerProps> = React.memo(({ regionsAffected }) => {
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

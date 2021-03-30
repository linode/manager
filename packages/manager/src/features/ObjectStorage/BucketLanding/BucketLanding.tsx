import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import { compose } from 'recompose';
import BucketIcon from 'src/assets/icons/entityIcons/bucket.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import OrderBy from 'src/components/OrderBy';
import Placeholder from 'src/components/Placeholder';
import TextField from 'src/components/TextField';
import TransferDisplay from 'src/components/TransferDisplay';
import { objectStorageClusterDisplay } from 'src/constants';
import bucketDrawerContainer, {
  DispatchProps,
} from 'src/containers/bucketDrawer.container';
import useObjectStorageBuckets from 'src/hooks/useObjectStorageBuckets';
import useObjectStorageClusters from 'src/hooks/useObjectStorageClusters';
import useOpenClose from 'src/hooks/useOpenClose';
import { BucketError } from 'src/store/bucket/types';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import {
  sendDeleteBucketEvent,
  sendDeleteBucketFailedEvent,
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
}));

interface Props {
  isRestrictedUser: boolean;
}

export type CombinedProps = Props & DispatchProps;

export const BucketLanding: React.FC<CombinedProps> = (props) => {
  const { isRestrictedUser, openBucketDrawer } = props;

  const classes = useStyles();

  const { objectStorageClusters } = useObjectStorageClusters();
  const {
    objectStorageBuckets,
    deleteObjectStorageBucket,
  } = useObjectStorageBuckets();

  const { data, loading, bucketErrors, lastUpdated } = objectStorageBuckets;

  const removeBucketConfirmationDialog = useOpenClose();
  const [bucketToRemove, setBucketToRemove] = React.useState<
    ObjectStorageBucket | undefined
  >(undefined);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [confirmBucketName, setConfirmBucketName] = React.useState<string>('');
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
    setError('');
    removeBucketConfirmationDialog.open();
  };

  const removeBucket = () => {
    // This shouldn't happen, but just in case (and to get TS to quit complaining...)
    if (!bucketToRemove) {
      return;
    }

    setError('');
    setIsLoading(true);

    const { cluster, label } = bucketToRemove;
    deleteObjectStorageBucket({ cluster, label })
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
        const errorText = getErrorStringOrDefault(e, 'Error removing bucket.');
        setError(errorText);
      });
  };

  const closeRemoveBucketConfirmationDialog = React.useCallback(() => {
    removeBucketConfirmationDialog.close();
  }, [removeBucketConfirmationDialog]);

  const setConfirmBucketNameToInput = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmBucketName(e.target.value);
    },
    []
  );

  const actions = () => (
    <ActionsPanel>
      <Button
        buttonType="cancel"
        onClick={closeRemoveBucketConfirmationDialog}
        data-qa-cancel
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        destructive
        onClick={removeBucket}
        data-qa-submit-rebuild
        loading={isLoading}
        disabled={
          bucketToRemove ? confirmBucketName !== bucketToRemove.label : true
        }
      >
        Delete Bucket
      </Button>
    </ActionsPanel>
  );

  const deleteBucketConfirmationMessage = bucketToRemove ? (
    <React.Fragment>
      <Typography>
        Deleting a bucket is permanent and can&apos;t be undone.
      </Typography>
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
      {data.length === 1 && <CancelNotice className={classes.copy} />}
      <Typography className={classes.copy}>
        To confirm deletion, type the name of the bucket (
        <b>{bucketToRemove.label}</b>) in the field below:
      </Typography>
    </React.Fragment>
  ) : null;

  if (isRestrictedUser) {
    return <RenderEmpty onClick={openBucketDrawer} />;
  }

  // Show a general error state if there is a Cluster error.
  if (objectStorageClusters.error) {
    return <RenderError data-qa-error-state />;
  }

  if (lastUpdated === 0 || loading) {
    return <RenderLoading />;
  }

  const allBucketRequestsFailed =
    bucketErrors?.length === objectStorageClusters.entities.length;

  // Show a general error state if all the bucket requests failed.
  if (allBucketRequestsFailed || objectStorageClusters.error) {
    return <RenderError data-qa-error-state />;
  }

  if (lastUpdated > 0 && data.length === 0) {
    return (
      <>
        {bucketErrors && <BucketErrorDisplay bucketErrors={bucketErrors} />}
        <RenderEmpty onClick={openBucketDrawer} />
      </>
    );
  }

  const totalUsage = sumBucketUsage(data);

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Buckets" />
      {bucketErrors && <BucketErrorDisplay bucketErrors={bucketErrors} />}
      <Grid item xs={12}>
        <OrderBy data={data} order={'asc'} orderBy={'label'}>
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
        {data.length > 1 ? (
          <Typography
            style={{ marginTop: 18, width: '100%', textAlign: 'center' }}
            variant="body1"
          >
            Total storage used: {readableBytes(totalUsage).formatted}
          </Typography>
        ) : null}
        <TransferDisplay spacingTop={data.length > 1 ? 8 : 18} />
      </Grid>
      <ConfirmationDialog
        open={removeBucketConfirmationDialog.isOpen}
        onClose={closeRemoveBucketConfirmationDialog}
        title={`Delete Bucket ${bucketToRemove ? bucketToRemove.label : ''}`}
        actions={actions}
        error={error}
      >
        {deleteBucketConfirmationMessage}
        <TextField
          onChange={setConfirmBucketNameToInput}
          expand
          label="Bucket Name"
        />
      </ConfirmationDialog>
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
        className={classes.empty}
        isEntity
        icon={BucketIcon}
        renderAsSecondary
        buttonProps={[
          {
            onClick: props.onClick,
            children: 'Create Bucket',
          },
        ]}
      >
        <Typography variant="subtitle1">Need help getting started?</Typography>
        <Typography variant="subtitle1">
          <a
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

interface BucketErrorDisplayProps {
  bucketErrors: BucketError[];
}

const BucketErrorDisplay: React.FC<BucketErrorDisplayProps> = React.memo(
  ({ bucketErrors }) => {
    return (
      <Banner
        regionsAffected={bucketErrors.map(
          (thisError) =>
            objectStorageClusterDisplay[thisError.clusterId] ??
            thisError.clusterId
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
    </Notice>
  );
});

export const sumBucketUsage = (buckets: ObjectStorageBucket[]) => {
  return buckets.reduce((acc, thisBucket) => {
    acc += thisBucket.size;
    return acc;
  }, 0);
};

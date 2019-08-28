import * as React from 'react';
import { compose } from 'recompose';
import BucketIcon from 'src/assets/icons/entityIcons/bucket.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Placeholder from 'src/components/Placeholder';
import TextField from 'src/components/TextField';
import bucketContainer, { StateProps } from 'src/containers/bucket.container';
import bucketDrawerContainer, {
  DispatchProps
} from 'src/containers/bucketDrawer.container';
import bucketRequestsContainer, {
  BucketsRequests
} from 'src/containers/bucketRequests.container';
import useOpenClose from 'src/hooks/useOpenClose';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { sendDeleteBucketEvent } from 'src/utilities/ga';
import { readableBytes } from 'src/utilities/unitConversions';
import BucketTable from './BucketTable';

type ClassNames = 'root' | 'confirmationCopy';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    confirmationCopy: {
      marginTop: theme.spacing(1)
    }
  });

type CombinedProps = StateProps &
  DispatchProps &
  WithStyles<ClassNames> &
  BucketsRequests;

export const BucketLanding: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    bucketsData,
    bucketsLoading,
    bucketsError,
    openBucketDrawer
  } = props;

  const removeBucketConfirmationDialog = useOpenClose();
  const [bucketToRemove, setBucketToRemove] = React.useState<
    Linode.Bucket | undefined
  >(undefined);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [confirmBucketName, setConfirmBucketName] = React.useState<string>('');

  const handleClickRemove = (bucket: Linode.Bucket) => {
    setBucketToRemove(bucket);
    setError('');
    removeBucketConfirmationDialog.open();
  };

  const removeBucket = () => {
    const { deleteBucket } = props;

    // This shouldn't happen, but just in case (and to get TS to quit complaining...)
    if (!bucketToRemove) {
      return;
    }

    setError('');
    setIsLoading(true);

    const { cluster, label } = bucketToRemove;
    // Passing in `force: 1` as a param to delete ALL items within
    // the bucket before deleting the bucket itself.
    deleteBucket({ cluster, label, params: { force: 1 } })
      .then(() => {
        removeBucketConfirmationDialog.close();
        setIsLoading(false);

        // @analytics
        sendDeleteBucketEvent(cluster);
      })
      .catch(e => {
        setIsLoading(false);
        const errorText = getErrorStringOrDefault(e, 'Error removing bucket.');
        setError(errorText);
      });
  };

  const actions = () => (
    <ActionsPanel>
      <Button
        buttonType="cancel"
        onClick={() => {
          removeBucketConfirmationDialog.close();
        }}
        data-qa-cancel
      >
        Cancel
      </Button>
      <Button
        buttonType="secondary"
        destructive
        onClick={removeBucket}
        data-qa-submit-rebuild
        loading={isLoading}
        disabled={
          bucketToRemove ? confirmBucketName !== bucketToRemove.label : true
        }
      >
        Delete
      </Button>
    </ActionsPanel>
  );

  const deleteBucketConfirmationMessage = bucketToRemove ? (
    <React.Fragment>
      {bucketToRemove.size > 0 ? (
        <Typography>
          This bucket contains{' '}
          <strong>
            {bucketToRemove.objects}{' '}
            {bucketToRemove.objects === 1 ? 'object' : 'objects'}
          </strong>{' '}
          totalling{' '}
          <strong>{readableBytes(bucketToRemove.size).formatted}</strong> that
          will be deleted along with the bucket. Deleting a bucket is permanent
          and can't be undone.
        </Typography>
      ) : (
        <Typography>
          Deleting a bucket is permanent and can't be undone.
        </Typography>
      )}
      <Typography className={classes.confirmationCopy}>
        To confirm deletion, type the name of the bucket ({bucketToRemove.label}
        ) in the field below:
      </Typography>
    </React.Fragment>
  ) : null;

  if (bucketsLoading) {
    return <RenderLoading data-qa-loading-state />;
  }

  if (bucketsError) {
    return <RenderError data-qa-error-state />;
  }

  if (bucketsData.length === 0) {
    return <RenderEmpty onClick={openBucketDrawer} data-qa-empty-state />;
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Buckets" />
      <Grid container justify="flex-end">
        <Grid item>
          <AddNewLink onClick={openBucketDrawer} label="Add a Bucket" />
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <OrderBy data={bucketsData} order={'asc'} orderBy={'label'}>
          {({ data: orderedData, handleOrderChange, order, orderBy }) => {
            const bucketTableProps = {
              orderBy,
              order,
              handleOrderChange,
              handleClickRemove,
              data: orderedData
            };
            return <BucketTable {...bucketTableProps} />;
          }}
        </OrderBy>
      </Grid>
      <ConfirmationDialog
        open={removeBucketConfirmationDialog.isOpen}
        onClose={() => {
          removeBucketConfirmationDialog.close();
        }}
        title={
          bucketToRemove ? `Delete ${bucketToRemove.label}` : 'Delete bucket'
        }
        actions={actions}
        error={error}
      >
        {deleteBucketConfirmationMessage}
        <TextField
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setConfirmBucketName(e.target.value)
          }
          expand
        />
      </ConfirmationDialog>
    </React.Fragment>
  );
};

const RenderLoading: React.StatelessComponent<{}> = () => {
  return <CircleProgress />;
};

const RenderError: React.StatelessComponent<{}> = () => {
  return (
    <ErrorState errorText="There was an error retrieving your buckets. Please reload and try again." />
  );
};

const RenderEmpty: React.StatelessComponent<{
  onClick: () => void;
}> = props => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Buckets" />
      <Placeholder
        title="Object Storage"
        copy={<EmptyCopy />}
        icon={BucketIcon}
        buttonProps={{
          onClick: props.onClick,
          children: 'Add a Bucket'
        }}
      />
    </React.Fragment>
  );
};

const EmptyCopy = () => (
  <>
    <Typography variant="subtitle1">Need help getting started?</Typography>
    <Typography variant="subtitle1">
      <a
        href="https://linode.com/docs/platform/object-storage/how-to-use-object-storage/"
        target="_blank"
        className="h-u"
      >
        Learn more about storage options for your multimedia, archives, and data
        backups here.
      </a>
    </Typography>
  </>
);

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  styled,
  bucketContainer,
  bucketRequestsContainer,
  bucketDrawerContainer
);

export default enhanced(BucketLanding);

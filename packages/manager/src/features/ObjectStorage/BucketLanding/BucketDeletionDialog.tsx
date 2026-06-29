import { Notice, Typography } from '@linode/ui';
import { useOpenClose } from '@linode/utilities';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useObjectStorageBuckets } from 'src/features/ObjectStorage/hooks/useObjectStorageBuckets';
import { useDeleteBucketMutation } from 'src/queries/object-storage/queries';
import {
  sendDeleteBucketEvent,
  sendDeleteBucketFailedEvent,
} from 'src/utilities/analytics/customEventAnalytics';

import { CancelNotice } from '../CancelNotice';

import type { APIError, ObjectStorageBucket } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  copy: {
    marginTop: theme.spacing(),
  },
}));

export interface BucketDeletionDialogRef {
  close: () => void;
  open: (bucket: ObjectStorageBucket) => void;
}

export const BucketDeletionDialogWithRef =
  React.forwardRef<BucketDeletionDialogRef>((_, ref) => {
    const { data: allBuckets } = useObjectStorageBuckets();

    const { classes } = useStyles();
    const removeBucketConfirmationDialog = useOpenClose();
    const {
      mutate: deleteBucket,
      isPending: deletionInProgress,
      error,
      reset,
    } = useDeleteBucketMutation();

    const [selectedBucket, setSelectedBucket] = React.useState<
      ObjectStorageBucket | undefined
    >(undefined);

    const open = React.useCallback(
      (bucket: ObjectStorageBucket) => {
        reset();
        setSelectedBucket(bucket);
        removeBucketConfirmationDialog.open();
      },
      [removeBucketConfirmationDialog, reset]
    );

    const close = React.useCallback(() => {
      removeBucketConfirmationDialog.close();
    }, [removeBucketConfirmationDialog]);

    React.useImperativeHandle(ref, () => ({ open, close }), [open, close]);

    const removeBucket = React.useCallback(async () => {
      if (!selectedBucket) {
        return;
      }

      const { label: bucketName, region: regionId } = selectedBucket;

      deleteBucket(
        { bucketName, regionId },
        {
          onSuccess: () => {
            removeBucketConfirmationDialog.close();
            sendDeleteBucketEvent(regionId);
          },
          onError: (_: APIError[]) => {
            sendDeleteBucketFailedEvent(regionId);
          },
        }
      );
    }, [deleteBucket, removeBucketConfirmationDialog, selectedBucket]);

    const bucketLabel = selectedBucket ? selectedBucket.label : '';

    return (
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
        loading={deletionInProgress}
        onClick={removeBucket}
        onClose={close}
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
        {allBuckets?.length === 1 && <CancelNotice className={classes.copy} />}
      </TypeToConfirmDialog>
    );
  });

BucketDeletionDialogWithRef.displayName = 'BucketDeletionDialogWithRef';

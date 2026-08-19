import { NotificationBanner } from '@akamai/cds-components/react';
import { useOpenClose } from '@linode/utilities';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useDeleteBucketMutation } from 'src/queries/object-storage/queries';
import {
  sendDeleteBucketEvent,
  sendDeleteBucketFailedEvent,
} from 'src/utilities/analytics/customEventAnalytics';

import { Link } from '../../shared/components/Link/Link';
import { CancelNotice } from '../../shared/components/Notice/CancelNotice';
import { useObjectStorageBuckets } from '../hooks/useObjectStorageBuckets';

import type { APIError, ObjectStorageBucket } from '@linode/api-v4';

export interface BucketDeletionDialogRef {
  close: () => void;
  open: (bucket: ObjectStorageBucket) => void;
}

export const BucketDeletionDialogWithRef =
  React.forwardRef<BucketDeletionDialogRef>((_, ref) => {
    const { data: allBuckets } = useObjectStorageBuckets();

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
    const deletingTheLastBucket = allBuckets?.length === 1;

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
        typographyStyle={{ marginTop: 'var(--token-global-spacing-s20)' }}
      >
        <NotificationBanner
          style={{ marginBottom: 'var(--token-global-spacing-s24)' }}
          type="warning"
        >
          <strong>Warning:</strong> Deleting a bucket is permanent and
          can&rsquo;t be undone.
        </NotificationBanner>

        <p
          style={{
            marginBottom: deletingTheLastBucket
              ? 'var(--token-global-spacing-s8)'
              : 0,
          }}
        >
          A bucket must be empty before deleting it. Please{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/lifecycle-policies">
            delete all objects
          </Link>
          , or use{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-object-storage#object-storage-tools">
            another tool
          </Link>{' '}
          to force deletion.
        </p>

        {deletingTheLastBucket && <CancelNotice />}
      </TypeToConfirmDialog>
    );
  });

BucketDeletionDialogWithRef.displayName = 'BucketDeletionDialogWithRef';

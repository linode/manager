import { CircleProgress, Drawer, ErrorState, Typography } from '@linode/ui';
import * as React from 'react';

import { useObjectStorageAccessKey } from 'src/queries/object-storage/queries';

import { AccessKeyBucketPermissionsTable } from './AccessKeyBucketPermissionsTable';

import type { APIError, ObjectStorageKey } from '@linode/api-v4';

export interface Props {
  accessKeyId: number | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export const AccessKeyBucketPermissionsDrawer = (props: Props) => {
  const { onClose, isOpen, accessKeyId } = props;

  const {
    data: objectStorageKey,
    isLoading,
    error,
  } = useObjectStorageAccessKey(
    accessKeyId ?? -1,
    accessKeyId !== null && accessKeyId !== undefined
  );

  return (
    <Drawer
      onClose={onClose}
      open={isOpen}
      title={`Permissions ${isLoading || error ? '' : `for ${objectStorageKey?.label}`}`}
      wide
    >
      <AccessKeyBucketPermissionsDrawerContent
        errors={error}
        isLoading={isLoading}
        objectStorageKey={objectStorageKey}
      />
    </Drawer>
  );
};

interface AccessKeyBucketPermissionsDrawerContentProps {
  errors: APIError[] | null;
  isLoading: boolean;
  objectStorageKey?: ObjectStorageKey;
}

const AccessKeyBucketPermissionsDrawerContent = ({
  objectStorageKey,
  isLoading,
  errors,
}: AccessKeyBucketPermissionsDrawerContentProps) => {
  if (isLoading) {
    return <CircleProgress />;
  }

  if (errors) {
    return <ErrorState errorText={errors[0].reason} />;
  }

  if (!objectStorageKey) {
    return null;
  }

  return objectStorageKey.limited === false ? (
    <Typography>
      This key has unlimited access to all buckets on your account.
    </Typography>
  ) : objectStorageKey.bucket_access === null ? (
    <Typography>This key has no permissions.</Typography>
  ) : (
    <>
      <Typography>This access key has the following permissions:</Typography>

      <AccessKeyBucketPermissionsTable
        bucket_access={objectStorageKey.bucket_access}
        checked={objectStorageKey.limited}
        mode="viewing"
        updateScopes={() => null}
      />
    </>
  );
};

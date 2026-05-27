import { CircleProgress, Drawer, Typography } from '@linode/ui';
import * as React from 'react';

import { useObjectStorageAccessKey } from 'src/queries/object-storage/queries';

import { BucketPermissionsTable } from './BucketPermissionsTable';

export interface Props {
  accessKeyId: number | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewPermissionsDrawer = (props: Props) => {
  const { onClose, isOpen, accessKeyId } = props;

  const { data: objectStorageKey, isLoading } = useObjectStorageAccessKey(
    accessKeyId ?? -1,
    accessKeyId !== null && accessKeyId !== undefined
  );

  return (
    <Drawer
      onClose={onClose}
      open={isOpen}
      title={`Permissions ${isLoading ? '' : `for ${objectStorageKey?.label}`}`}
      wide
    >
      {isLoading && <CircleProgress />}

      {!objectStorageKey ? null : objectStorageKey.limited === false ? (
        <Typography>
          This key has unlimited access to all buckets on your account.
        </Typography>
      ) : objectStorageKey.bucket_access === null ? (
        <Typography>This key has no permissions.</Typography>
      ) : (
        <>
          <Typography>
            This access key has the following permissions:
          </Typography>

          <BucketPermissionsTable
            bucket_access={objectStorageKey.bucket_access}
            checked={objectStorageKey.limited}
            mode="viewing"
            updateScopes={() => null}
          />
        </>
      )}
    </Drawer>
  );
};

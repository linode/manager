import { Drawer, Typography } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { useObjectStorageAccessKey } from 'src/queries/object-storage/queries';

import { useIsObjMultiClusterEnabled } from '../hooks/useIsObjectStorageGen2Enabled';
import { AccessTable } from './AccessTable';
import { BucketPermissionsTable } from './BucketPermissionsTable';

export interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ViewPermissionsDrawer = (props: Props) => {
  const { onClose, isOpen } = props;
  const { accessKeyId } = useParams({ strict: false });

  const { data: objectStorageKey } = useObjectStorageAccessKey(accessKeyId);
  const { isObjMultiClusterEnabled } = useIsObjMultiClusterEnabled();

  return (
    <Drawer
      onClose={onClose}
      open={isOpen}
      title={`Permissions for ${objectStorageKey?.label}`}
      wide
    >
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

          {isObjMultiClusterEnabled ? (
            <BucketPermissionsTable
              bucket_access={objectStorageKey.bucket_access}
              checked={objectStorageKey.limited}
              mode="viewing"
              updateScopes={() => null}
            />
          ) : (
            <AccessTable
              bucket_access={objectStorageKey.bucket_access}
              checked={objectStorageKey.limited}
              mode="viewing"
              updateScopes={() => null}
            />
          )}
        </>
      )}
    </Drawer>
  );
};

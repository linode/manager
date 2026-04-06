import { Drawer, Typography } from '@linode/ui';
import * as React from 'react';

import { useIsObjMultiClusterEnabled } from '../hooks/useIsObjectStorageGen2Enabled';
import { AccessTable } from './AccessTable';
import { BucketPermissionsTable } from './BucketPermissionsTable';

import type { ObjectStorageKey } from '@linode/api-v4';

export interface Props {
  objectStorageKey: null | ObjectStorageKey;
  onClose: () => void;
  open: boolean;
}

export const ViewPermissionsDrawer = (props: Props) => {
  const { objectStorageKey, onClose, open } = props;

  const { isObjMultiClusterEnabled } = useIsObjMultiClusterEnabled();

  return (
    <Drawer
      onClose={onClose}
      open={open}
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

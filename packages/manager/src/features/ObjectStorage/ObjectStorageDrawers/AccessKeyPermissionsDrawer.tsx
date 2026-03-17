import { Drawer, Typography } from '@linode/ui';
import * as React from 'react';

import { AccessTable } from '../AccessKeyLanding/AccessTable';
import { BucketPermissionsTable } from '../AccessKeyLanding/BucketPermissionsTable';
import { useIsObjMultiClusterEnabled } from '../hooks/useIsObjectStorageGen2Enabled';

import type { ObjectStorageKey } from '@linode/api-v4';

export interface Props {
  isOpened: boolean;
  objcetStorageKey: ObjectStorageKey;
  onClose: () => void;
}

export const AccessKeyPermissionsDrawer = ({
  onClose,
  objcetStorageKey,
  isOpened,
}: Props) => {
  const { isObjMultiClusterEnabled } = useIsObjMultiClusterEnabled();

  return (
    <Drawer
      onClose={onClose}
      open={isOpened}
      title={`Permissions for ${objcetStorageKey?.label}`}
      wide
    >
      {!objcetStorageKey ? null : objcetStorageKey.limited === false ? (
        <Typography>
          This key has unlimited access to all buckets on your account.
        </Typography>
      ) : objcetStorageKey.bucket_access === null ? (
        <Typography>This key has no permissions.</Typography>
      ) : (
        <>
          <Typography>
            This access key has the following permissions:
          </Typography>

          {isObjMultiClusterEnabled ? (
            <BucketPermissionsTable
              bucket_access={objcetStorageKey.bucket_access}
              checked={objcetStorageKey.limited}
              mode="viewing"
              updateScopes={() => null}
            />
          ) : (
            <AccessTable
              bucket_access={objcetStorageKey.bucket_access}
              checked={objcetStorageKey.limited}
              mode="viewing"
              updateScopes={() => null}
            />
          )}
        </>
      )}
    </Drawer>
  );
};

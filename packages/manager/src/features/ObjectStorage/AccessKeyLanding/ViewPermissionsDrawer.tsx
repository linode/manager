import { Typography } from '@linode/ui';
import { isFeatureEnabledV2 } from '@linode/utilities';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';

import { AccessTable } from './AccessTable';
import { BucketPermissionsTable } from './BucketPermissionsTable';

import type { ObjectStorageKey } from '@linode/api-v4';

export interface Props {
  objectStorageKey: ObjectStorageKey | null;
  onClose: () => void;
  open: boolean;
}

export const ViewPermissionsDrawer = (props: Props) => {
  const { objectStorageKey, onClose, open } = props;

  const flags = useFlags();
  const { account } = useAccountManagement();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Permissions for ${objectStorageKey?.label}`}
      wide
    >
      {!objectStorageKey ? null : objectStorageKey.bucket_access === null ? (
        <Typography>
          This key has unlimited access to all buckets on your account.
        </Typography>
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

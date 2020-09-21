import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';

import { AccessTable } from './LimitedAccessControls';
export interface Props {
  open: boolean;
  onClose: () => void;
  objectStorageKey: ObjectStorageKey | null;
}

type CombinedProps = Props;

export const ViewPermissionsDrawer: React.FC<CombinedProps> = props => {
  const { open, onClose, objectStorageKey } = props;

  if (objectStorageKey === null) {
    return null;
  }

  return (
    <Drawer
      title={`Permissions for ${objectStorageKey.label}`}
      open={open}
      onClose={onClose}
      wide
    >
      {objectStorageKey.bucket_access === null ? (
        <Typography>
          This key has unlimited access to all buckets on your account.
        </Typography>
      ) : (
        <>
          <Typography>
            This access key has the following permissions:
          </Typography>
          <AccessTable
            mode={'viewing'}
            bucket_access={objectStorageKey.bucket_access}
            updateScopes={() => null}
            checked={objectStorageKey.limited}
          />
        </>
      )}
    </Drawer>
  );
};

export default React.memo(ViewPermissionsDrawer);

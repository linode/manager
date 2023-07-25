import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';
import { Typography } from 'src/components/Typography';

import { AccessTable } from './AccessTable';

export interface Props {
  objectStorageKey: ObjectStorageKey | null;
  onClose: () => void;
  open: boolean;
}

type CombinedProps = Props;

export const ViewPermissionsDrawer: React.FC<CombinedProps> = (props) => {
  const { objectStorageKey, onClose, open } = props;

  if (objectStorageKey === null) {
    return null;
  }

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Permissions for ${objectStorageKey.label}`}
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
            bucket_access={objectStorageKey.bucket_access}
            checked={objectStorageKey.limited}
            mode={'viewing'}
            updateScopes={() => null}
          />
        </>
      )}
    </Drawer>
  );
};

export default React.memo(ViewPermissionsDrawer);

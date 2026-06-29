import React from 'react';

import { useObjectStorageAccessKey } from 'src/queries/object-storage/queries';

import { useAccessKeyDrawers } from './hooks/useAccessKeyDrawers';
import { HostNamesDrawer } from './HostNamesDrawer';
import { AccessKeyDrawer } from './OMC_AccessKeyDrawer';
import { ViewPermissionsDrawer } from './ViewPermissionsDrawer';

export const AccessKeysDrawerOutlet = () => {
  const { drawer, closeDrawer } = useAccessKeyDrawers();

  const { data: objectStorageKey } = useObjectStorageAccessKey(
    drawer?.accessKeyId ?? -1,
    drawer?.accessKeyId !== null && drawer?.accessKeyId !== undefined
  );

  return (
    <>
      <AccessKeyDrawer
        isOpen={drawer?.type === 'create-access-key'}
        mode="creating"
        onClose={closeDrawer}
      />

      <AccessKeyDrawer
        isOpen={drawer?.type === 'edit-access-key'}
        mode="editing"
        objectStorageKey={objectStorageKey}
        onClose={closeDrawer}
      />

      <ViewPermissionsDrawer
        accessKeyId={drawer?.accessKeyId}
        isOpen={drawer?.type === 'access-key-permissions'}
        onClose={closeDrawer}
      />

      <HostNamesDrawer
        accessKeyId={drawer?.accessKeyId}
        isOpen={drawer?.type === 'access-key-hostnames'}
        onClose={closeDrawer}
      />
    </>
  );
};

import React from 'react';

import { useObjectStorageAccessKey } from 'src/queries/object-storage/queries';

import { useAccessKeyDrawers } from './hooks/useAccessKeyDrawers';
import { HostNamesDrawer } from './HostNamesDrawer';
import { AccessKeyDrawer } from './OMC_AccessKeyDrawer';
import { ViewPermissionsDrawer } from './ViewPermissionsDrawer';

export const AccessKeysDrawerOutlet = () => {
  const { drawer, closeDrawer } = useAccessKeyDrawers();

  const { data: objectStorageKey } = useObjectStorageAccessKey(
    drawer?.accessKeyId
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
        isOpen={drawer?.type === 'access-key-permissions'}
        objectStorageKey={objectStorageKey}
        onClose={closeDrawer}
      />

      <HostNamesDrawer
        isOpen={drawer?.type === 'access-key-hostnames'}
        objectStorageKey={objectStorageKey}
        onClose={closeDrawer}
      />
    </>
  );
};

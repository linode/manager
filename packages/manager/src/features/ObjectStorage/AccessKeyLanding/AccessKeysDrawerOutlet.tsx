import React from 'react';

import { useIsObjMultiClusterEnabled } from '../hooks/useIsObjectStorageGen2Enabled';
import { useAccessKeyDrawers } from './hooks/useAccessKeyDrawers';
import { HostNamesDrawer } from './HostNamesDrawer';
import { AccessKeyDrawer } from './OMC_AccessKeyDrawer';
import { ViewPermissionsDrawer } from './ViewPermissionsDrawer';

export const AccessKeysDrawerOutlet = () => {
  const { drawer, closeDrawer } = useAccessKeyDrawers();

  const { isObjMultiClusterEnabled } = useIsObjMultiClusterEnabled();

  return (
    <>
      <AccessKeyDrawer
        isOpen={drawer === 'create-access-key'}
        mode="creating"
        onClose={closeDrawer}
      />

      <AccessKeyDrawer
        isOpen={drawer === 'edit-access-key'}
        mode="editing"
        onClose={closeDrawer}
      />

      <ViewPermissionsDrawer
        isOpen={drawer === 'access-key-permissions'}
        onClose={closeDrawer}
      />

      {isObjMultiClusterEnabled && (
        <HostNamesDrawer
          isOpen={drawer === 'access-key-hostnames'}
          onClose={closeDrawer}
        />
      )}
    </>
  );
};

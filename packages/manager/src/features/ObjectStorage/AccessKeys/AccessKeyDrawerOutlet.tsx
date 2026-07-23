import React from 'react';

import { AccessKeyFormDrawer } from './AccessKeyForm/AccessKeyFormDrawer';
import { EndpointHostnamesDrawer } from './EndpointHostnames/EndpointHostnamesDrawer';
import { useAccessKeyDrawers } from './hooks/useAccessKeyDrawers';
import { AccessKeyBucketPermissionsDrawer } from './Permissions/AccessKeyBucketPermissionsDrawer';

export const AccessKeyDrawerOutlet = () => {
  const { drawer, closeDrawer } = useAccessKeyDrawers();

  return (
    <>
      <AccessKeyFormDrawer
        isOpen={drawer?.type === 'create-access-key'}
        mode="creating"
        onClose={closeDrawer}
      />

      <AccessKeyFormDrawer
        accessKeyId={drawer?.accessKeyId}
        isOpen={drawer?.type === 'edit-access-key'}
        mode="editing"
        onClose={closeDrawer}
      />

      <AccessKeyBucketPermissionsDrawer
        accessKeyId={drawer?.accessKeyId}
        isOpen={drawer?.type === 'access-key-permissions'}
        onClose={closeDrawer}
      />

      <EndpointHostnamesDrawer
        accessKeyId={drawer?.accessKeyId}
        isOpen={drawer?.type === 'access-key-hostnames'}
        onClose={closeDrawer}
      />
    </>
  );
};

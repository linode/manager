import * as React from 'react';
import ManagedIcon from 'src/assets/icons/managed.svg';
import Placeholder from 'src/components/Placeholder';

const ManagedPlaceholder = () => (
  <Placeholder
    icon={ManagedIcon}
    title="Linode Managed"
    copy={`Linode Managed is only available in the Classic Manager.`}
    buttonProps={[
      {
        onClick: () =>
          window.open('https://manager.linode.com/account#managed', '_blank'),
        children: 'Navigate to Classic Manager'
      }
    ]}
  />
);

export default ManagedPlaceholder;

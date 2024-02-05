import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';

import { LoadBalancerRegions } from '../../LoadBalancerRegions';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const EditLoadBalancerRegionsDrawer = (props: Props) => {
  const { onClose: handleClose, open } = props;

  return (
    <Drawer onClose={handleClose} open={open} title="Edit Regions">
      <LoadBalancerRegions sx={{ paddingX: 0 }} />
      <ActionsPanel
        primaryButtonProps={{
          label: 'Save Changes',
          onClick: handleClose,
          type: 'button',
        }}
        secondaryButtonProps={{
          label: 'Cancel',
          onClick: handleClose,
        }}
      />
    </Drawer>
  );
};

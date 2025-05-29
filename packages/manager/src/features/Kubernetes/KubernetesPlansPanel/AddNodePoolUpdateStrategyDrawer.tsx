import { Drawer, Select } from '@linode/ui';
import React from 'react';

interface Props {
  onClose: (isClosed: boolean) => void;
  open: boolean;
}

export const AddNodePoolUpdateStrategyDrawer = (props: Props) => {
  const { onClose, open } = props;
  return (
    <Drawer onClose={onClose} open={open} title='Configure Node Pool X GB Plan'>
      <Select label="Update Strategy" options={[]} />
      <Select label="Firewall" options={[]} />
    </Drawer>
  );
};

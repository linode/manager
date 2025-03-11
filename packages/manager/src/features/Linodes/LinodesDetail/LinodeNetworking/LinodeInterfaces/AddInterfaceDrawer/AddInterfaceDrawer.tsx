import { Drawer } from '@linode/ui';
import React from 'react';

import { AddInterfaceForm } from './AddInterfaceForm';

interface Props {
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const AddInterfaceDrawer = (props: Props) => {
  const { linodeId, onClose, open } = props;

  return (
    <Drawer onClose={onClose} open={open} title="Add Network Interface">
      <AddInterfaceForm linodeId={linodeId} onClose={onClose} />
    </Drawer>
  );
};

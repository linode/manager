import { Drawer } from '@linode/ui';
import React from 'react';

import { NotFound } from 'src/components/NotFound';

import { AddInterfaceForm } from './AddInterfaceForm';

interface Props {
  linodeId: number;
  onClose: () => void;
  open: boolean;
  regionId: string;
}

export const AddInterfaceDrawer = (props: Props) => {
  const { linodeId, onClose, open, regionId } = props;

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title="Add Network Interface"
    >
      <AddInterfaceForm
        linodeId={linodeId}
        onClose={onClose}
        regionId={regionId}
      />
    </Drawer>
  );
};

import { Drawer } from '@linode/ui';
import React from 'react';

import { EditInterfaceForm } from './EditInterfaceForm';

interface Props {
  interfaceId: number | undefined;
  linodeId: number;
  onClose: () => void;
  open: boolean;
  regionId: string;
}

export const EditInterfaceDrawer = (props: Props) => {
  const { interfaceId, linodeId, onClose, open, regionId } = props;

  return (
    <Drawer onClose={onClose} open={open} title="Edit Network Interface">
      {interfaceId && (
        <EditInterfaceForm
          interfaceId={interfaceId}
          linodeId={linodeId}
          onClose={onClose}
          regionId={regionId}
        />
      )}
    </Drawer>
  );
};

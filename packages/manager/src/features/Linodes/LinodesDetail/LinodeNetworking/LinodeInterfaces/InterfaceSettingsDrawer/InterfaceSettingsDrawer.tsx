import { Drawer } from '@linode/ui';
import React from 'react';

import { InterfaceSettingsForm } from './InterfaceSettingsForm';

interface Props {
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const InterfaceSettingsDrawer = (props: Props) => {
  return (
    <Drawer title="Interface Settings" {...props}>
      <InterfaceSettingsForm
        linodeId={props.linodeId}
        onClose={props.onClose}
      />
    </Drawer>
  );
};

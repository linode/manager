import { Linode, Volume } from '@linode/api-v4';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';

import { LinodeVolumeAttachForm } from './LinodeVolumeAttachForm';
import { LinodeVolumeCreateForm } from './LinodeVolumeCreateForm';
import { ModeSelection } from './ModeSelection';

interface Props {
  linode: Linode;
  onClose: () => void;
  open: boolean;
  openDetails: (volume: Volume) => void;
}

export const LinodeVolumeAddDrawer = (props: Props) => {
  const { linode, onClose, open, openDetails } = props;

  const [mode, setMode] = React.useState<'attach' | 'create'>('create');

  return (
    <Drawer
      title={
        mode === 'attach'
          ? `Attach Volume to ${linode.label}`
          : `Create Volume for ${linode.label}`
      }
      onClose={onClose}
      open={open}
    >
      <ModeSelection mode={mode} onChange={setMode} />
      {mode === 'attach' ? (
        <LinodeVolumeAttachForm linode={linode} onClose={onClose} />
      ) : (
        <LinodeVolumeCreateForm
          linode={linode}
          onClose={onClose}
          openDetails={openDetails}
        />
      )}
    </Drawer>
  );
};

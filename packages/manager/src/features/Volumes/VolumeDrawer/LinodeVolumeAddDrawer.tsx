import { Linode } from '@linode/api-v4';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';

import { LinodeVolumeAttachForm } from './LinodeVolumeAttachForm';
import { LinodeVolumeCreateForm } from './LinodeVolumeCreateForm';
import { ModeSelection } from './ModeSelection';

interface Props {
  linode: Linode;
  onClose: () => void;
  open: boolean;
}

export const LinodeVolumeAddDrawer = (props: Props) => {
  const { linode, onClose, open } = props;

  const [mode, setMode] = React.useState<'attach' | 'create'>('create');

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={mode === 'attach' ? 'Attach Volume' : 'Create Volume'}
    >
      <ModeSelection mode={mode} onChange={setMode} />
      {mode === 'attach' ? (
        <LinodeVolumeAttachForm linode={linode} onClose={onClose} />
      ) : (
        <LinodeVolumeCreateForm linode={linode} onClose={onClose} />
      )}
    </Drawer>
  );
};

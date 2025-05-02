import { Drawer, Notice, Typography } from '@linode/ui';
import * as React from 'react';

import { BLOCK_STORAGE_CLIENT_LIBRARY_UPDATE_REQUIRED_COPY } from 'src/components/Encryption/constants';
import { useIsBlockStorageEncryptionFeatureEnabled } from 'src/components/Encryption/utils';

import { LinodeVolumeAttachForm } from './LinodeVolumeAttachForm';
import { LinodeVolumeCreateForm } from './LinodeVolumeCreateForm';
import { ModeSelection } from './ModeSelection';

import type { Linode, Volume } from '@linode/api-v4';

interface Props {
  linode: Linode;
  onClose: () => void;
  open: boolean;
  openDetails: (volume: Volume) => void;
}

export const LinodeVolumeAddDrawer = (props: Props) => {
  const { linode, onClose, open, openDetails } = props;

  const [mode, setMode] = React.useState<'attach' | 'create'>('create');

  const [clientLibraryCopyVisible, setClientLibraryCopyVisible] =
    React.useState(false);

  const { isBlockStorageEncryptionFeatureEnabled } =
    useIsBlockStorageEncryptionFeatureEnabled();

  const linodeSupportsBlockStorageEncryption = Boolean(
    linode.capabilities?.includes('Block Storage Encryption')
  );

  const toggleMode = (mode: 'attach' | 'create') => {
    setMode(mode);
    setClientLibraryCopyVisible(false);
  };

  const closeDrawer = () => {
    if (mode !== 'create') {
      setMode('create');
    }
    onClose();
  };

  return (
    <Drawer
      onClose={closeDrawer}
      open={open}
      title={
        mode === 'attach'
          ? `Attach Volume to ${linode.label}`
          : `Create Volume for ${linode.label}`
      }
    >
      <ModeSelection mode={mode} onChange={toggleMode} />
      {isBlockStorageEncryptionFeatureEnabled &&
        !linodeSupportsBlockStorageEncryption &&
        clientLibraryCopyVisible && (
          <Notice variant="warning">
            <Typography>
              {BLOCK_STORAGE_CLIENT_LIBRARY_UPDATE_REQUIRED_COPY}
            </Typography>
          </Notice>
        )}
      {mode === 'attach' ? (
        <LinodeVolumeAttachForm
          linode={linode}
          onClose={closeDrawer}
          setClientLibraryCopyVisible={(visible: boolean) =>
            setClientLibraryCopyVisible(visible)
          }
        />
      ) : (
        <LinodeVolumeCreateForm
          linode={linode}
          linodeSupportsBlockStorageEncryption={
            linodeSupportsBlockStorageEncryption
          }
          onClose={closeDrawer}
          openDetails={openDetails}
          setClientLibraryCopyVisible={(visible: boolean) =>
            setClientLibraryCopyVisible(visible)
          }
        />
      )}
    </Drawer>
  );
};

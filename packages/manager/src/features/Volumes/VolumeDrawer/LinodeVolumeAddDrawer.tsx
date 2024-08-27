import * as React from 'react';

import { Drawer } from 'src/components/Drawer';
import { BLOCK_STORAGE_CLIENT_LIBRARY_UPDATE_REQUIRED_COPY } from 'src/components/Encryption/constants';
import { useIsBlockStorageEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';

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
  const [
    clientLibraryCopyVisible,
    setClientLibraryCopyVisible,
  ] = React.useState(false);

  const {
    isBlockStorageEncryptionFeatureEnabled,
  } = useIsBlockStorageEncryptionFeatureEnabled();

  const linodeSupportsBlockStorageEncryption = linode.capabilities?.includes(
    'blockstorage_encryption'
  );

  const toggleMode = (mode: 'attach' | 'create') => {
    setMode(mode);
    setClientLibraryCopyVisible(false);
  };

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
          setClientLibraryCopyVisible={(visible: boolean) =>
            setClientLibraryCopyVisible(visible)
          }
          linode={linode}
          onClose={onClose}
        />
      ) : (
        <LinodeVolumeCreateForm
          linodeSupportsBlockStorageEncryption={
            linodeSupportsBlockStorageEncryption
          }
          setClientLibraryCopyVisible={(visible: boolean) =>
            setClientLibraryCopyVisible(visible)
          }
          linode={linode}
          onClose={onClose}
          openDetails={openDetails}
        />
      )}
    </Drawer>
  );
};

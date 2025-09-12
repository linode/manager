import { useVolumeQuery } from '@linode/queries';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { DeleteVolumeDialog } from '../Dialogs/DeleteVolumeDialog';
import { DetachVolumeDialog } from '../Dialogs/DetachVolumeDialog';
import { UpgradeVolumeDialog } from '../Dialogs/UpgradeVolumeDialog';
import { AttachVolumeDrawer } from './AttachVolumeDrawer/AttachVolumeDrawer';
import { CloneVolumeDrawer } from './CloneVolumeDrawer/CloneVolumeDrawer';
import { EditVolumeDrawer } from './EditVolumeDrawer/EditVolumeDrawer';
import { ManageTagsDrawer } from './ManageTagsDrawer/ManageTagsDrawer';
import { ResizeVolumeDrawer } from './ResizeVolumeDrawer';
import { VolumeDetailsDrawer } from './VolumeDetailsDrawer';

interface Props {
  onCloseHandler: () => void;
}

export const VolumeDrawers = ({ onCloseHandler }: Props) => {
  const params = useParams({ strict: false });

  const {
    data: selectedVolume,
    isFetching: isFetchingVolume,
    error: selectedVolumeError,
  } = useVolumeQuery(Number(params.volumeId), !!params.volumeId);

  return (
    <>
      <AttachVolumeDrawer
        isFetching={isFetchingVolume}
        onClose={onCloseHandler}
        open={params.action === 'attach'}
        volume={selectedVolume}
      />
      <VolumeDetailsDrawer
        isFetching={isFetchingVolume}
        onClose={onCloseHandler}
        open={params.action === 'details'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
      <ManageTagsDrawer
        isFetching={isFetchingVolume}
        onClose={onCloseHandler}
        open={params.action === 'manage-tags'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
      <EditVolumeDrawer
        isFetching={isFetchingVolume}
        onClose={onCloseHandler}
        open={params.action === 'edit'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
      <ResizeVolumeDrawer
        isFetching={isFetchingVolume}
        onClose={onCloseHandler}
        open={params.action === 'resize'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
      <CloneVolumeDrawer
        isFetching={isFetchingVolume}
        onClose={onCloseHandler}
        open={params.action === 'clone'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
      <DetachVolumeDialog
        isFetching={isFetchingVolume}
        onClose={onCloseHandler}
        open={params.action === 'detach'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
      <UpgradeVolumeDialog
        isFetching={isFetchingVolume}
        onClose={onCloseHandler}
        open={params.action === 'upgrade'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
      <DeleteVolumeDialog
        isFetching={isFetchingVolume}
        onClose={onCloseHandler}
        open={params.action === 'delete'}
        volume={selectedVolume}
        volumeError={selectedVolumeError}
      />
    </>
  );
};

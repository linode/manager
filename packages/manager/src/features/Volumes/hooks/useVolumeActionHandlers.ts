import { useNavigate } from '@tanstack/react-router';

import type { VolumeAction } from 'src/routes/volumes';

export const useVolumeActionHandlers = (baseUrl: string) => {
  const navigate = useNavigate();
  const handleVolumeAction = (action: VolumeAction, volumeId: number) => {
    navigate({
      params: { action, volumeId },
      search: (prev) => prev,
      to: `${baseUrl}/$action`,
    });
  };

  const getActionHandlers = (volumeId: number) => ({
    handleAttach: () => handleVolumeAction('attach', volumeId),
    handleClone: () => handleVolumeAction('clone', volumeId),
    handleDelete: () => handleVolumeAction('delete', volumeId),
    handleDetach: () => handleVolumeAction('detach', volumeId),
    handleDetails: () => handleVolumeAction('details', volumeId),
    handleEdit: () => handleVolumeAction('edit', volumeId),
    handleManageTags: () => handleVolumeAction('manage-tags', volumeId),
    handleResize: () => handleVolumeAction('resize', volumeId),
    handleUpgrade: () => handleVolumeAction('upgrade', volumeId),
  });

  return { getActionHandlers };
};

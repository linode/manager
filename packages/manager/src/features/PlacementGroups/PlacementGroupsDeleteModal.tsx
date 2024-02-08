import { AFFINITY_TYPES } from '@linode/api-v4';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useDeletePlacementGroup } from 'src/queries/placementGroups';

import type { PlacementGroup } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  selectedPlacementGroup: PlacementGroup | undefined;
}

export const PlacementGroupsDeleteModal = (props: Props) => {
  const { onClose, open, selectedPlacementGroup } = props;
  const {
    error,
    isLoading,
    mutateAsync: deletePlacementGroup,
  } = useDeletePlacementGroup(selectedPlacementGroup?.id ?? -1);

  if (!selectedPlacementGroup) {
    return null;
  }

  const onDelete = () => {
    deletePlacementGroup().then(() => {
      onClose();
    });
  };

  const { affinity_type, label } = selectedPlacementGroup;

  const dialogTitle = `Delete Placement Group ${label} (${AFFINITY_TYPES[affinity_type]})`;

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: label,
        primaryBtnText: 'Delete',
        type: 'Placement Group',
      }}
      label="Placement Group"
      loading={isLoading}
      onClick={onDelete}
      onClose={onClose}
      open={open}
      title={dialogTitle}
    >
      {error && <Notice text={error?.[0]?.reason} variant="error" />}
    </TypeToConfirmDialog>
  );
};

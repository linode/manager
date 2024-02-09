import { AFFINITY_TYPES } from '@linode/api-v4';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
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
    reset,
  } = useDeletePlacementGroup(selectedPlacementGroup?.id ?? -1);

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onDelete = async () => {
    try {
      await deletePlacementGroup();
      onClose();
    } catch (e) {}
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: selectedPlacementGroup?.label,
        primaryBtnText: 'Delete',
        type: 'Placement Groups',
      }}
      errors={
        !selectedPlacementGroup
          ? [{ reason: 'Placement Group not found.' }]
          : undefined
      }
      title={
        selectedPlacementGroup
          ? `Delete Placement Group ${selectedPlacementGroup?.label} (${
              AFFINITY_TYPES[selectedPlacementGroup?.affinity_type]
            })`
          : 'Delete Placement Group'
      }
      disabled={!selectedPlacementGroup}
      label="Placement Group"
      loading={isLoading}
      onClick={onDelete}
      onClose={onClose}
      open={open}
    >
      {error && (
        <Notice
          key={selectedPlacementGroup?.id}
          text={error?.[0]?.reason}
          variant="error"
        />
      )}
      <Notice variant="warning">
        <Typography>
          <strong>Warning:</strong> deleting a placement group is permanent and
          can’t be undone.
        </Typography>
      </Notice>
    </TypeToConfirmDialog>
  );
};

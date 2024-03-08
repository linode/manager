import { AFFINITY_TYPES } from '@linode/api-v4';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { Button } from 'src/components/Button/Button';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { Notice } from 'src/components/Notice/Notice';
import { RemovableSelectionsList } from 'src/components/RemovableSelectionsList/RemovableSelectionsList';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { usePlacementGroupData } from 'src/hooks/usePlacementGroupsData';
import {
  useDeletePlacementGroup,
  usePlacementGroupQuery,
  useUnassignLinodesFromPlacementGroup,
} from 'src/queries/placementGroups';

import type {
  Linode,
  UnassignLinodesFromPlacementGroupPayload,
} from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const PlacementGroupsDeleteModal = (props: Props) => {
  const { onClose, open } = props;
  const { id } = useParams<{ id: string }>();
  const { data: selectedPlacementGroup } = usePlacementGroupQuery(
    +id,
    Boolean(id)
  );
  const {
    assignedLinodes,
    isLoading: placementGroupDataLoading,
    linodesCount: assignedLinodesCount,
  } = usePlacementGroupData({
    placementGroup: selectedPlacementGroup,
  });
  const {
    error: deletePlacementError,
    isLoading: deletePlacementLoading,
    mutateAsync: deletePlacementGroup,
    reset: resetDeletePlacementGroup,
  } = useDeletePlacementGroup(selectedPlacementGroup?.id ?? -1);
  const {
    error: unassignLinodeError,
    isLoading: unassignLinodeLoading,
    mutateAsync: unassignLinodes,
    reset: resetUnassignLinodes,
  } = useUnassignLinodesFromPlacementGroup(selectedPlacementGroup?.id ?? -1);

  const error = deletePlacementError || unassignLinodeError;

  React.useEffect(() => {
    if (open) {
      resetDeletePlacementGroup();
      resetUnassignLinodes();
    }
  }, [open, resetUnassignLinodes, resetDeletePlacementGroup]);

  const handleUnassignLinode = async (linode: Linode) => {
    const payload: UnassignLinodesFromPlacementGroupPayload = {
      linodes: [linode.id],
    };

    await unassignLinodes(payload);
  };

  const onDelete = async () => {
    await deletePlacementGroup();
    onClose();
  };

  const placementGroupLabel = selectedPlacementGroup
    ? `Placement Group ${selectedPlacementGroup?.label} (${
        AFFINITY_TYPES[selectedPlacementGroup.affinity_type]
      })`
    : 'Placement Group';

  const isDisabled = !selectedPlacementGroup || assignedLinodesCount > 0;

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: selectedPlacementGroup?.label,
        primaryBtnText: 'Delete',
        type: 'Placement Group',
      }}
      errors={
        !selectedPlacementGroup
          ? [{ reason: 'Placement Group not found.' }]
          : undefined
      }
      disableTypeToConfirmInput={isDisabled}
      disableTypeToConfirmSubmit={isDisabled}
      label="Placement Group"
      loading={placementGroupDataLoading || deletePlacementLoading}
      onClick={onDelete}
      onClose={onClose}
      open={open}
      title={`Delete ${placementGroupLabel}`}
    >
      {error && (
        <Notice
          key={selectedPlacementGroup?.id}
          text={error?.[0]?.reason}
          variant="error"
        />
      )}

      <Notice spacingTop={8} variant="warning">
        <Typography>
          <strong>Warning:</strong>
        </Typography>
        <List
          sx={(theme) => ({
            '& > li': {
              display: 'list-item',
              fontSize: '0.875rem',
              pb: 0,
              pl: 0,
            },
            listStyle: 'disc',
            ml: theme.spacing(2),
            mt: theme.spacing(),
          })}
        >
          <ListItem>
            Deleting a placement group is permanent and cannot be undone.
          </ListItem>
          <ListItem>
            You need to unassign all Linodes before deleting a placement group.
          </ListItem>
        </List>
      </Notice>
      <RemovableSelectionsList
        RemoveButton={() => (
          <Button
            sx={(theme) => ({
              fontFamily: theme.font.normal,
              fontSize: '0.875rem',
            })}
            loading={unassignLinodeLoading}
            variant="text"
          >
            Unassign
          </Button>
        )}
        headerText={`Linodes assigned to ${placementGroupLabel}`}
        id="assigned-linodes"
        maxWidth={540}
        noDataText="No Linodes assigned to this Placement Group."
        onRemove={handleUnassignLinode}
        selectionData={assignedLinodes ?? []}
        sx={{ mb: 3, mt: 1 }}
      />
    </TypeToConfirmDialog>
  );
};

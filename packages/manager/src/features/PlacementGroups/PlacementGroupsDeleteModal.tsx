import {
  useDeletePlacementGroup,
  useUnassignLinodesFromPlacementGroup,
} from '@linode/queries';
import { Button, List, ListItem, Notice, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { RemovableSelectionsList } from 'src/components/RemovableSelectionsList/RemovableSelectionsList';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';

import { getPlacementGroupLinodes } from './utils';

import type {
  Linode,
  PlacementGroup,
  UnassignLinodesFromPlacementGroupPayload,
} from '@linode/api-v4';
import type { ButtonProps } from '@linode/ui';

interface Props {
  disableUnassignButton: boolean;
  isFetching: boolean;
  linodes: Linode[] | undefined;
  onClose: () => void;
  open: boolean;
  selectedPlacementGroup: PlacementGroup | undefined;
}

export const PlacementGroupsDeleteModal = (props: Props) => {
  const {
    disableUnassignButton,
    isFetching,
    linodes,
    onClose,
    open,
    selectedPlacementGroup,
  } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    error: deletePlacementError,
    isPending: deletePlacementLoading,
    mutateAsync: deletePlacementGroup,
    reset: resetDeletePlacementGroup,
  } = useDeletePlacementGroup(selectedPlacementGroup?.id ?? -1);
  const {
    error: unassignLinodeError,
    mutateAsync: unassignLinodes,
    reset: resetUnassignLinodes,
  } = useUnassignLinodesFromPlacementGroup(selectedPlacementGroup?.id ?? -1);
  const [assignedLinodes, setAssignedLinodes] = React.useState<
    Linode[] | undefined
  >(undefined);

  React.useEffect(() => {
    if (selectedPlacementGroup && linodes) {
      setAssignedLinodes(
        getPlacementGroupLinodes(selectedPlacementGroup, linodes)
      );
    }
  }, [selectedPlacementGroup, linodes]);

  const error = deletePlacementError || unassignLinodeError;

  const handleUnassignLinode = async (linode: Linode) => {
    const payload: UnassignLinodesFromPlacementGroupPayload = {
      linodes: [linode.id],
    };

    await unassignLinodes(payload);

    enqueueSnackbar(`Linode ${linode.label} successfully unassigned.`, {
      variant: 'success',
    });
  };

  const onDelete = async () => {
    await deletePlacementGroup();

    enqueueSnackbar(
      `Placement Group ${selectedPlacementGroup?.label} successfully deleted.`,
      {
        variant: 'success',
      }
    );
    handleClose();
  };

  const handleClose = () => {
    resetDeletePlacementGroup();
    resetUnassignLinodes();
    onClose();
  };

  const assignedLinodesCount = assignedLinodes?.length ?? 0;
  const isDisabled = !selectedPlacementGroup || assignedLinodesCount > 0;

  return (
    <TypeToConfirmDialog
      disableTypeToConfirmInput={isDisabled}
      disableTypeToConfirmSubmit={isDisabled}
      entity={{
        action: 'deletion',
        name: selectedPlacementGroup?.label,
        primaryBtnText: 'Delete',
        type: 'Placement Group',
      }}
      expand
      isFetching={isFetching}
      label="Placement Group"
      loading={deletePlacementLoading}
      onClick={onDelete}
      onClose={handleClose}
      open={open}
      title={`Delete Placement Group ${selectedPlacementGroup?.label}`}
    >
      {error && (
        <Notice
          key={selectedPlacementGroup?.id}
          text={error?.[0]?.reason}
          variant="error"
        />
      )}

      {assignedLinodesCount > 0 ? (
        <>
          <Notice spacingTop={8} variant="warning">
            <Typography>
              <strong>Warning:</strong>
            </Typography>
            <List>
              <ListItem>
                Deleting a placement group is permanent and cannot be undone.
              </ListItem>
              <ListItem>
                You need to unassign all Linodes before deleting a placement
                group.
              </ListItem>
            </List>
          </Notice>
          <RemovableSelectionsList
            disableItemsOnRemove
            hasEncounteredMutationError={Boolean(unassignLinodeError)}
            headerText={`Linodes assigned to Placement Group ${selectedPlacementGroup?.label}`}
            id="assigned-linodes"
            maxWidth={540}
            noDataText="No Linodes assigned to this Placement Group."
            onRemove={handleUnassignLinode}
            RemoveButton={(props: ButtonProps) => (
              <Button
                {...props}
                disabled={disableUnassignButton || props.disabled}
                sx={(theme) => ({
                  font: theme.font.normal,
                  fontSize: '0.875rem',
                })}
                variant="text"
              >
                Unassign
              </Button>
            )}
            selectionData={assignedLinodes ?? []}
            showLoadingIndicatorOnRemove
            sx={{ mb: 3, mt: 1 }}
          />
        </>
      ) : (
        <Notice spacingTop={8} variant="warning">
          Deleting a placement group is permanent and cannot be undone.
        </Notice>
      )}
    </TypeToConfirmDialog>
  );
};

import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { Notice } from 'src/components/Notice/Notice';
import { RemovableSelectionsList } from 'src/components/RemovableSelectionsList/RemovableSelectionsList';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import {
  useDeletePlacementGroup,
  useUnassignLinodesFromPlacementGroup,
} from 'src/queries/placementGroups';

import { getPlacementGroupLinodes } from './utils';

import type {
  Linode,
  PlacementGroup,
  UnassignLinodesFromPlacementGroupPayload,
} from '@linode/api-v4';
import type { ButtonProps } from 'src/components/Button/Button';

interface Props {
  disableUnassignButton: boolean;
  linodes: Linode[] | undefined;
  onClose: () => void;
  open: boolean;
  selectedPlacementGroup: PlacementGroup | undefined;
}

export const PlacementGroupsDeleteModal = (props: Props) => {
  const {
    disableUnassignButton,
    linodes,
    onClose,
    open,
    selectedPlacementGroup,
  } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    error: deletePlacementError,
    isLoading: deletePlacementLoading,
    mutateAsync: deletePlacementGroup,
  } = useDeletePlacementGroup(selectedPlacementGroup?.id ?? -1);
  const {
    error: unassignLinodeError,
    mutateAsync: unassignLinodes,
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

    enqueueSnackbar('Linode successfully unassigned', {
      variant: 'success',
    });
  };

  const onDelete = async () => {
    await deletePlacementGroup();

    enqueueSnackbar('Placement Group successfully deleted.', {
      variant: 'success',
    });
    onClose();
  };

  const assignedLinodesCount = assignedLinodes?.length ?? 0;
  const isDisabled = !selectedPlacementGroup || assignedLinodesCount > 0;

  if (!selectedPlacementGroup) {
    return null;
  }

  if (!assignedLinodes) {
    return (
      <ConfirmationDialog
        sx={{
          '& .MuiDialog-paper': {
            '& > .MuiDialogContent-root > div': {
              maxHeight: 300,
              padding: 4,
            },
            maxHeight: 500,
            width: 500,
          },
        }}
        onClose={onClose}
        open={open}
        title="Delete Placement Group"
      >
        <CircleProgress />
      </ConfirmationDialog>
    );
  }

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: selectedPlacementGroup.label,
        primaryBtnText: 'Delete',
        type: 'Placement Group',
      }}
      disableTypeToConfirmInput={isDisabled}
      disableTypeToConfirmSubmit={isDisabled}
      label="Placement Group"
      loading={deletePlacementLoading}
      onClick={onDelete}
      onClose={onClose}
      open={open}
      title={`Delete Placement Group ${selectedPlacementGroup.label}`}
    >
      {error && (
        <Notice
          key={selectedPlacementGroup.id}
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
                You need to unassign all Linodes before deleting a placement
                group.
              </ListItem>
            </List>
          </Notice>
          <RemovableSelectionsList
            RemoveButton={(props: ButtonProps) => (
              <Button
                {...props}
                sx={(theme) => ({
                  fontFamily: theme.font.normal,
                  fontSize: '0.875rem',
                })}
                disabled={disableUnassignButton || props.disabled}
                variant="text"
              >
                Unassign
              </Button>
            )}
            disableItemsOnRemove
            hasEncounteredMutationError={Boolean(unassignLinodeError)}
            headerText={`Linodes assigned to Placement Group ${selectedPlacementGroup.label}`}
            id="assigned-linodes"
            maxWidth={540}
            noDataText="No Linodes assigned to this Placement Group."
            onRemove={handleUnassignLinode}
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

import { AFFINITY_TYPES } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { NotFound } from 'src/components/NotFound';
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
  PlacementGroup,
  UnassignLinodesFromPlacementGroupPayload,
} from '@linode/api-v4';

interface Props {
  disableUnassignButton: boolean;
  onClose: () => void;
  onExited?: () => void;
  open: boolean;
  selectedPlacementGroup: PlacementGroup | undefined;
}

export const PlacementGroupsDeleteModal = (props: Props) => {
  const {
    disableUnassignButton,
    onClose,
    onExited,
    open,
    selectedPlacementGroup,
  } = props;
  const { id } = useParams<{ id: string }>();
  const { data: placementGroupFromParam, isFetching } = usePlacementGroupQuery(
    Number(id),
    Boolean(!selectedPlacementGroup)
  );
  const placementGroup = selectedPlacementGroup ?? placementGroupFromParam;
  const {
    assignedLinodes,
    isLoading: placementGroupDataLoading,
    linodesCount: assignedLinodesCount,
  } = usePlacementGroupData({
    placementGroup,
  });
  const {
    error: deletePlacementError,
    isLoading: deletePlacementLoading,
    mutateAsync: deletePlacementGroup,
    reset: resetDeletePlacementGroup,
  } = useDeletePlacementGroup(placementGroup?.id ?? -1);
  const {
    error: unassignLinodeError,
    isLoading: unassignLinodeLoading,
    mutateAsync: unassignLinodes,
    reset: resetUnassignLinodes,
  } = useUnassignLinodesFromPlacementGroup(placementGroup?.id ?? -1);

  const { enqueueSnackbar } = useSnackbar();

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
    const toastMessage = `Linode successfully unassigned`;
    enqueueSnackbar(toastMessage, {
      variant: 'success',
    });
  };

  const onDelete = async () => {
    await deletePlacementGroup();
    const toastMessage = `Placement Group successfully deleted.`;
    enqueueSnackbar(toastMessage, {
      variant: 'success',
    });
    onClose();
  };

  const placementGroupLabel = placementGroup
    ? `Placement Group ${placementGroup?.label} (${
        AFFINITY_TYPES[placementGroup.affinity_type]
      })`
    : 'Placement Group';

  const isDisabled = !placementGroup || assignedLinodesCount > 0;

  if (!placementGroup) {
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
        {isFetching ? <CircleProgress /> : <NotFound />}
      </ConfirmationDialog>
    );
  }

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: placementGroup?.label,
        primaryBtnText: 'Delete',
        type: 'Placement Group',
      }}
      disableTypeToConfirmInput={isDisabled}
      disableTypeToConfirmSubmit={isDisabled}
      label="Placement Group"
      loading={placementGroupDataLoading || deletePlacementLoading}
      onClick={onDelete}
      onClose={onClose}
      onExited={onExited}
      open={open}
      title={`Delete ${placementGroupLabel}`}
    >
      {error && (
        <Notice
          key={placementGroup?.id}
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
            RemoveButton={() => (
              <Button
                sx={(theme) => ({
                  fontFamily: theme.font.normal,
                  fontSize: '0.875rem',
                })}
                disabled={disableUnassignButton}
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
        </>
      ) : (
        <Notice spacingTop={8} variant="warning">
          Deleting a placement group is permanent and cannot be undone.
        </Notice>
      )}
    </TypeToConfirmDialog>
  );
};

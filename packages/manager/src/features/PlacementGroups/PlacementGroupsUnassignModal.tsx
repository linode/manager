import { CircleProgress, Notice } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { NotFound } from 'src/components/NotFound';
import { Typography } from 'src/components/Typography';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useUnassignLinodesFromPlacementGroup } from 'src/queries/placementGroups';

import type {
  Linode,
  UnassignLinodesFromPlacementGroupPayload,
} from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  selectedLinode: Linode | undefined;
}

export const PlacementGroupsUnassignModal = (props: Props) => {
  const { onClose, open, selectedLinode } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { id: placementGroupId, linodeId } = useParams<{
    id: string;
    linodeId: string;
  }>();

  const [linode, setLinode] = React.useState<Linode | undefined>(
    selectedLinode
  );

  const {
    error,
    isPending,
    mutateAsync: unassignLinodes,
  } = useUnassignLinodesFromPlacementGroup(+placementGroupId);

  const { data: linodeFromQuery, isFetching } = useLinodeQuery(
    +linodeId,
    open && selectedLinode === undefined
  );

  React.useEffect(() => {
    if (open) {
      setLinode(selectedLinode ?? linodeFromQuery);
    }
  }, [selectedLinode, linodeFromQuery, open]);

  const payload: UnassignLinodesFromPlacementGroupPayload = {
    linodes: [linode?.id ?? -1],
  };

  const onUnassign = async () => {
    await unassignLinodes(payload);
    const toastMessage = linode
      ? `Linode ${linode?.label} successfully unassigned.`
      : 'Linode successfully unassigned.';
    enqueueSnackbar(toastMessage, {
      variant: 'success',
    });
    onClose();
  };

  const isLinodeReadOnly = useIsResourceRestricted({
    grantLevel: 'read_write',
    grantType: 'linode',
    id: +linodeId,
  });

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        disabled: isPending || isLinodeReadOnly,
        label: 'Unassign',
        loading: isPending,
        onClick: onUnassign,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: onClose,
      }}
    />
  );

  if (!linode) {
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
    <ConfirmationDialog
      actions={actions}
      error={error?.[0]?.reason}
      onClose={onClose}
      open={open}
      title={linode?.label ? `Unassign ${linode.label}` : 'Unassign'}
    >
      {!linode && (
        <Notice
          text="There was a problem retrieving this linode"
          variant="error"
        />
      )}
      <Typography>Are you sure you want to unassign this Linode?</Typography>
    </ConfirmationDialog>
  );
};

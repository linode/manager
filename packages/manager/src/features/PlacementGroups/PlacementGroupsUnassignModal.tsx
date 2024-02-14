import * as React from 'react';
import { useParams } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useUnassignLinodesFromPlacementGroup } from 'src/queries/placementGroups';

import type { UnassignLinodesFromPlacementGroupPayload } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const PlacementGroupsUnassignModal = (props: Props) => {
  const { onClose, open } = props;
  const { id: placementGroupId, linodeId } = useParams<{
    id: string;
    linodeId: string;
  }>();
  const {
    error,
    isLoading,
    mutateAsync: unassignLinodes,
  } = useUnassignLinodesFromPlacementGroup(Number(placementGroupId) ?? -1);
  const { data: selectedLinode } = useLinodeQuery(Number(linodeId) ?? -1);

  const payload: UnassignLinodesFromPlacementGroupPayload = {
    linodes: [Number(linodeId) ?? -1],
  };

  const onUnassign = async () => {
    await unassignLinodes(payload);
    onClose();
  };

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        disabled: isLoading,
        label: 'Unassign',
        loading: isLoading,
        onClick: onUnassign,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: onClose,
      }}
    />
  );

  return (
    <ConfirmationDialog
      title={
        selectedLinode?.label ? `Unassign ${selectedLinode.label}` : 'Unassign'
      }
      actions={actions}
      error={error?.[0]?.reason}
      onClose={onClose}
      open={open}
    >
      {!selectedLinode && (
        <Notice
          text="There was a problem retrieving this linode"
          variant="error"
        />
      )}
      <Typography>Are you sure you want to remove this Linode?</Typography>
    </ConfirmationDialog>
  );
};

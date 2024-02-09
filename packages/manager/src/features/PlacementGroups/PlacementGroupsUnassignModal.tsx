import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { Linode } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  selectedLinode: Linode | undefined;
}

export const PlacementGroupsUnassignModal = (props: Props) => {
  const { onClose, open, selectedLinode } = props;

  if (!selectedLinode) {
    return null;
  }

  const { label } = selectedLinode;

  return (
    <ConfirmationDialog
      onClose={onClose}
      open={open}
      title={label ? `Unassign ${label}` : 'Unassign'}
    />
  );
};

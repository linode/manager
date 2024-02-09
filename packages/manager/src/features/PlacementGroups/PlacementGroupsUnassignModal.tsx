import * as React from 'react';
import { useParams } from 'react-router-dom';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const PlacementGroupsUnassignModal = (props: Props) => {
  const { onClose, open } = props;
  const { linodeId } = useParams<{ linodeId: string }>();

  console.log(useParams());

  return (
    <ConfirmationDialog
      onClose={onClose}
      open={open}
      title={linodeId ? `Unassign ${linodeId}` : 'Unassign'}
    />
  );
};

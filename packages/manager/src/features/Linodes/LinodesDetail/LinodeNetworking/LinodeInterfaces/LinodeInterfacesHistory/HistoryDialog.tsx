import { ActionsPanel, Dialog } from '@linode/ui';
import * as React from 'react';

import { HistoryTable } from './HistoryTable';

interface Props {
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const HistoryDialog = (props: Props) => {
  const { linodeId, onClose, open } = props;

  return (
    <Dialog
      fullWidth
      onClose={onClose}
      open={open}
      title="Network Interfaces History"
    >
      <HistoryTable linodeId={linodeId} />
      <ActionsPanel
        secondaryButtonProps={{
          label: 'Close',
          onClick: onClose,
        }}
      />
    </Dialog>
  );
};

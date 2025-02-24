import { Dialog } from '@linode/ui';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

import { LinodeInterfacesHistoryTable } from './LinodeInterfacesHistoryTable';

interface Props {
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const LinodeInterfacesHistoryDialog = (props: Props) => {
  const { linodeId, onClose, open } = props;

  return (
    <Dialog
      fullHeight
      fullWidth
      onClose={onClose}
      open={open}
      title="Network Interfaces History"
    >
      <LinodeInterfacesHistoryTable linodeId={linodeId} open={open} />
      <ActionsPanel
        secondaryButtonProps={{
          label: 'Close',
          onClick: onClose,
        }}
      />
    </Dialog>
  );
};

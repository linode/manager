import React from 'react';

import { Dialog } from 'src/components/Dialog/Dialog';

import { LinodeRebuildForm } from './LinodeRebuildForm';

interface Props {
  linodeId: number | undefined;
  linodeLabel: string | undefined;
  onClose: () => void;
  open: boolean;
}

export const LinodeRebuildDialog = (props: Props) => {
  const { linodeId, linodeLabel, onClose, open } = props;

  return (
    <Dialog
      fullHeight
      fullWidth
      onClose={onClose}
      open={open}
      title={`Rebuild Linode ${linodeLabel}`}
    >
      {linodeId && linodeLabel && (
        <LinodeRebuildForm
          linodeId={linodeId}
          linodeLabel={linodeLabel}
          onSuccess={onClose}
        />
      )}
    </Dialog>
  );
};

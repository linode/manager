import React from 'react';

import { Dialog } from 'src/components/Dialog/Dialog';
import { useLinodeQuery } from 'src/queries/linodes/linodes';

import { LinodeRebuildForm } from './LinodeRebuildForm';

interface Props {
  linodeId: number | undefined;
  linodeLabel: string | undefined;
  onClose: () => void;
  open: boolean;
}

export const LinodeRebuildDialog = (props: Props) => {
  const { linodeId, linodeLabel, onClose, open } = props;

  const { data: linode, isLoading } = useLinodeQuery(
    linodeId ?? -1,
    Boolean(linodeId)
  );

  return (
    <Dialog
      fullHeight
      fullWidth
      isFetching={isLoading}
      onClose={onClose}
      open={open}
      title={`Rebuild Linode ${linodeLabel}`}
    >
      {linode && <LinodeRebuildForm linode={linode} onSuccess={onClose} />}
    </Dialog>
  );
};

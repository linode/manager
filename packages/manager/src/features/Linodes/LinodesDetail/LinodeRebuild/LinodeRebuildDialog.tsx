import { useLinodeQuery } from '@linode/queries';
import { Dialog } from '@linode/ui';
import React from 'react';

import { LinodeRebuildForm } from './LinodeRebuildForm';

interface Props {
  linodeId: number | undefined;
  linodeLabel: string | undefined;
  onClose: () => void;
  open: boolean;
}

export const LinodeRebuildDialog = (props: Props) => {
  const { linodeId, linodeLabel, onClose, open } = props;

  const {
    data: linode,
    error,
    isLoading,
  } = useLinodeQuery(linodeId ?? -1, linodeId !== undefined);

  return (
    <Dialog
      error={error?.[0].reason}
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

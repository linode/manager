import { useLinodeQuery } from '@linode/queries';
import { Dialog, Notice } from '@linode/ui';
import React from 'react';

import { LINODE_REBUILD_LOCKED_NOTICE_TEXT } from 'src/features/Linodes/constants';

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

  const isLocked = !!linode?.locks?.length;

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
      {isLocked && (
        <Notice
          spacingBottom={16}
          text={LINODE_REBUILD_LOCKED_NOTICE_TEXT}
          variant="warning"
        />
      )}
      {linode && <LinodeRebuildForm linode={linode} onSuccess={onClose} />}
    </Dialog>
  );
};

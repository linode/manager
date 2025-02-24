import { Dialog } from '@linode/ui';
import * as React from 'react';

interface Props {
  onClose: () => void;
  open: boolean;
}
export const LinodeInterfacesHistory = (props: Props) => {
  const { onClose, open } = props;

  return (
    <Dialog
      fullHeight
      fullWidth
      onClose={onClose}
      open={open}
      title="Network Interfaces History"
    >
      <></>
    </Dialog>
  );
};

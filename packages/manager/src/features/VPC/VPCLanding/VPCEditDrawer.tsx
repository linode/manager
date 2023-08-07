import { VPC } from '@linode/api-v4/lib/vpcs/types';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';

interface Props {
  onClose: () => void;
  open: boolean;
  vpc: VPC | undefined;
}

export const VPCEditDrawer = (props: Props) => {
  const { onClose, open, vpc } = props;

  return (
    <Drawer onClose={onClose} open={open} title={`Edit (${vpc?.label})`}>
      test {vpc?.label}
    </Drawer>
  );
};

import * as React from 'react';

import { StandardRescueDialog } from './StandardRescueDialog';

export interface Props {
  linodeId: number | undefined;
  linodeLabel: string | undefined;
  onClose: () => void;
  open: boolean;
}

export const RescueDialog = (props: Props) => {
  const { linodeId, linodeLabel, onClose, open } = props;

  return (
    <StandardRescueDialog
      linodeId={linodeId}
      linodeLabel={linodeLabel}
      onClose={onClose}
      open={open}
    />
  );
};

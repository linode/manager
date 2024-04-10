import React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { Dialog } from 'src/components/Dialog/Dialog';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { StackScript } from 'src/components/StackScript/StackScript';
import { useStackScriptQuery } from 'src/queries/stackscripts';

interface Props {
  id: number | undefined;
  onClose: () => void;
  open: boolean;
}

export const StackScriptDetailsDialog = (props: Props) => {
  const { id, onClose, open } = props;

  const { data: stackscript, error, isLoading } = useStackScriptQuery(
    id ?? -1,
    Boolean(id)
  );

  const title = stackscript
    ? `${stackscript.username} / ${stackscript.label}`
    : 'StackScript';

  return (
    <Dialog
      fullHeight
      fullWidth
      maxWidth="md"
      onClose={onClose}
      open={open}
      title={title}
    >
      {isLoading && <CircleProgress />}
      {error && <ErrorState errorText={error[0].reason} />}
      {stackscript && <StackScript data={stackscript} userCanModify={false} />}
    </Dialog>
  );
};

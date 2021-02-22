import * as React from 'react';
import Dialog, { DialogProps } from 'src/components/core/Dialog';
import DialogContent from 'src/components/core/DialogContent';

import DialogTitle from 'src/components/DialogTitle';
interface Props extends DialogProps {
  title: string;
  onClose: () => void;
}

export const InformationDialog: React.FC<Props> = props => {
  const { title, children, ...dialogProps } = props;
  return (
    <Dialog
      {...dialogProps}
      disableBackdropClick={true}
      PaperProps={{ role: undefined }}
      role="dialog"
    >
      <DialogTitle
        className="dialog-title"
        title={title}
        onClose={props.onClose}
      />
      <DialogContent data-qa-dialog-content className="dialog-content">
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(InformationDialog);

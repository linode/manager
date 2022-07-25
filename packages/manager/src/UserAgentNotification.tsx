import * as React from 'react';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

interface Props {
  open: boolean;
  onClose: () => void;
  warning?: string;
}

const UserAgentNotification = ({ open, onClose, warning }: Props) => {
  return (
    <ConfirmationDialog
      data-qa-browser-warning
      actions={
        <Button onClick={onClose} buttonType="primary">
          Dismiss
        </Button>
      }
      open={open}
      onClose={onClose}
      title="Please update your browser"
    >
      {warning}
    </ConfirmationDialog>
  );
};

export default UserAgentNotification;

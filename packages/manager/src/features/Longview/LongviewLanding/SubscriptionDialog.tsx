import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';

interface Props {
  clientLimit: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const SubscriptionDialog: React.FC<Props> = props => {
  const { clientLimit, isOpen, onClose, onSubmit } = props;

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="cancel" onClick={onClose}>
        Cancel
      </Button>

      <Button buttonType="primary" onClick={onSubmit} role="link">
        View upgrade options
      </Button>
    </ActionsPanel>
  );

  return (
    <Dialog
      title="Maximum Clients Reached"
      open={isOpen}
      onClose={onClose}
      actions={actions}
    >
      <Typography variant="body1">
        Your current plan allows you to create up to {clientLimit} clients. To
        create more clients and receive additional benefits, such as longer data
        retention and more frequent data updates, please upgrade your plan.
      </Typography>
    </Dialog>
  );
};

export default SubscriptionDialog;

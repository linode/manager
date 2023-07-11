import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { managedText } from './LongviewPlans';

interface Props {
  clientLimit: number;
  isOpen: boolean;
  isManaged: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const SubscriptionDialog: React.FC<Props> = (props) => {
  const { clientLimit, isManaged, isOpen, onClose, onSubmit } = props;

  const actions = () => (
    <ActionsPanel
      showPrimary
      primaryButtonHandler={onSubmit}
      primaryButtonRole="link"
      primaryButtonText={isManaged ? 'Contact Support' : 'View upgrade options'}
      showSecondary
      secondaryButtonHandler={onClose}
      secondaryButtonText="Cancel"
    />
  );

  const text = isManaged ? (
    managedText
  ) : (
    <span>
      Your current plan allows you to create up to {clientLimit} clients. To
      create more clients and receive additional benefits, such as longer data
      retention and more frequent data updates, please upgrade your plan.
    </span>
  );

  return (
    <ConfirmationDialog
      title="Maximum Clients Reached"
      open={isOpen}
      onClose={onClose}
      actions={actions}
    >
      <Typography variant="body1">{text}</Typography>
    </ConfirmationDialog>
  );
};

export default SubscriptionDialog;

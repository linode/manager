import { ActionsPanel, Typography } from '@linode/ui';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import { managedText } from './LongviewPlans';

interface Props {
  clientLimit: number;
  isManaged: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const SubscriptionDialog = (props: Props) => {
  const { clientLimit, isManaged, isOpen, onClose, onSubmit } = props;

  const actions = () => (
    <ActionsPanel
      primaryButtonProps={{
        label: isManaged ? 'Contact Support' : 'View upgrade options',
        onClick: onSubmit,
        role: 'link',
      }}
      secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
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
      actions={actions}
      onClose={onClose}
      open={isOpen}
      title="Maximum Clients Reached"
    >
      <Typography variant="body1">{text}</Typography>
    </ConfirmationDialog>
  );
};

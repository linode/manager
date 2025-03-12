import { ActionsPanel, Typography } from '@linode/ui';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

interface Actions {
  cancel: () => void;
  executePayment: () => void;
  isMakingPayment: boolean;
}

interface Props extends Actions {
  error: null | string;
  open: boolean;
  usd: string;
}

export const CreditCardDialog = (props: Props) => {
  const { cancel, error, executePayment, isMakingPayment, open, usd } = props;

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Confirm Payment',
            loading: isMakingPayment,
            onClick: executePayment,
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: cancel,
          }}
        />
      }
      error={error ?? undefined}
      onClose={cancel}
      open={open}
      title="Confirm Payment"
    >
      <Typography>{`Confirm payment of $${usd} USD to Linode LLC?`}</Typography>
    </ConfirmationDialog>
  );
};

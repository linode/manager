import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';

interface Actions {
  cancel: () => void;
  executePayment: () => void;
  isMakingPayment: boolean;
}

interface Props extends Actions {
  error?: JSX.Element | string;
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
      onClose={cancel}
      open={open}
      title="Confirm Payment"
    >
      {error && <Notice variant="error">{error}</Notice>}
      <Typography>{`Confirm payment of $${usd} USD to Linode LLC?`}</Typography>
    </ConfirmationDialog>
  );
};

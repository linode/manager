import { Notice } from '@linode/ui';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';

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
      onClose={cancel}
      open={open}
      title="Confirm Payment"
    >
      {error && <Notice text={error} variant="error" />}
      <Typography>{`Confirm payment of $${usd} USD to Linode LLC?`}</Typography>
    </ConfirmationDialog>
  );
};

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
  error: null | string;
  open: boolean;
  usd: string;
}

export const CreditCardDialog = (props: Props) => {
  const { cancel, error, open, usd, ...actionsProps } = props;

  return (
    <ConfirmationDialog
      actions={<DialogActions {...actionsProps} cancel={cancel} />}
      onClose={cancel}
      open={open}
      title="Confirm Payment"
    >
      {error && <Notice text={error} variant="error" />}
      <Typography>{`Confirm payment of $${usd} USD to Linode LLC?`}</Typography>
    </ConfirmationDialog>
  );
};

class DialogActions extends React.PureComponent<Actions> {
  render() {
    return (
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          label: 'Confirm Payment',
          loading: this.props.isMakingPayment,
          onClick: this.props.executePayment,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          label: 'Cancel',
          onClick: this.props.cancel,
        }}
      />
    );
  }
}

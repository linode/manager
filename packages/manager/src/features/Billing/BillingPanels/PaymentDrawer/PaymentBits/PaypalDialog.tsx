import * as React from 'react';
import { compose } from 'recompose';

import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import DialogActions, {
  Props as ActionsProps
} from './PaypalDialogActionButtons';

interface Props extends ActionsProps {
  open: boolean;
  usd: string;
}

type CombinedProps = Props;

interface Content {
  title: string;
  message?: string;
  error?: string;
}

const PaypalDialog: React.SFC<CombinedProps> = props => {
  const {
    open,
    closeDialog,
    usd,
    ...rest // ...rest being the other unused ActionsProps
  } = props;

  const renderActions = () => (
    <DialogActions closeDialog={closeDialog} {...rest} />
  );

  const handleCloseDialog = () => closeDialog(false);

  const dialogContent: Content = props.isStagingPaypalPayment
    ? {
        title: 'Preparing Payment'
      }
    : props.paypalPaymentFailed
    ? {
        title: 'Payment failed',
        error: 'Could not complete PayPal payment'
      }
    : {
        title: 'Confirm Payment',
        message: `Confirm PayPal payment for $${usd} USD to Linode LLC?`
      };

  return (
    <ConfirmationDialog
      open={open}
      error={dialogContent.error}
      title={dialogContent.title}
      onClose={handleCloseDialog}
      actions={renderActions()}
    >
      <Typography>{dialogContent.message || ''}</Typography>
    </ConfirmationDialog>
  );
};

export default compose<CombinedProps, Props>(React.memo)(PaypalDialog);

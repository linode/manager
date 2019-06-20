import * as React from 'react';
import { compose } from 'recompose';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';

export interface Props {
  isStagingPaypalPayment: boolean;
  paypalPaymentFailed: boolean;
  isExecutingPayment: boolean;
  initExecutePayment: () => void;
  closeDialog: (wasCancelled: boolean) => void;
}

type CombinedProps = Props;

const PaypalDialogActionButtons: React.SFC<CombinedProps> = props => {
  const {
    isStagingPaypalPayment,
    paypalPaymentFailed,
    isExecutingPayment,
    initExecutePayment,
    closeDialog
  } = props;

  /** intentionally displays "payment cancelled" message to the user */
  const handleCancelPayment = () => closeDialog(true);

  const handleCloseDialog = () => closeDialog(false);

  if (isStagingPaypalPayment) {
    return (
      <ActionsPanel>
        <Button loading={true}>Preparing Payment</Button>
      </ActionsPanel>
    );
  } else if (paypalPaymentFailed) {
    return (
      <ActionsPanel>
        <Button onClick={handleCloseDialog}>Got it</Button>
      </ActionsPanel>
    );
  } else {
    return (
      <ActionsPanel>
        <Button
          buttonType="cancel"
          onClick={handleCancelPayment}
          data-qa-cancel
        >
          Cancel
        </Button>
        <Button
          buttonType="secondary"
          loading={isExecutingPayment}
          onClick={initExecutePayment}
          data-qa-submit
        >
          Confirm Payment
        </Button>
      </ActionsPanel>
    );
  }
};

export default compose<CombinedProps, Props>(React.memo)(
  PaypalDialogActionButtons
);

import * as React from 'react';
import { compose } from 'recompose';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
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

type CombinedProps = Props;

const CreditCardDialog: React.SFC<CombinedProps> = (props) => {
  const { cancel, error, open, usd, ...actionsProps } = props;

  return (
    <ConfirmationDialog
      actions={<DialogActions {...actionsProps} cancel={cancel} />}
      onClose={cancel}
      open={open}
      title="Confirm Payment"
    >
      {error && <Notice error text={error} />}
      <Typography>{`Confirm payment of $${usd} USD to Linode LLC?`}</Typography>
    </ConfirmationDialog>
  );
};

export default compose<CombinedProps, Props>(React.memo)(CreditCardDialog);

class DialogActions extends React.PureComponent<Actions> {
  render() {
    return (
      <ActionsPanel>
        <Button
          buttonType="secondary"
          data-qa-cancel
          onClick={this.props.cancel}
        >
          Cancel
        </Button>
        <Button
          buttonType="primary"
          data-qa-submit
          data-testid="credit-card-submit"
          loading={this.props.isMakingPayment}
          onClick={this.props.executePayment}
        >
          Confirm Payment
        </Button>
      </ActionsPanel>
    );
  }
}

import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

interface Actions {
  executePayment: () => void;
  cancel: () => void;
  isMakingPayment: boolean;
}

interface Props extends Actions {
  open: boolean;
  usd: string;
  error: string | null;
}

const CreditCardDialog = (props: Props) => {
  const { cancel, error, open, usd, ...actionsProps } = props;

  return (
    <ConfirmationDialog
      open={open}
      title="Confirm Payment"
      onClose={cancel}
      actions={<DialogActions {...actionsProps} cancel={cancel} />}
    >
      {error && <Notice error text={error} />}
      <Typography>{`Confirm payment of $${usd} USD to Linode LLC?`}</Typography>
    </ConfirmationDialog>
  );
};

export default React.memo(CreditCardDialog);

class DialogActions extends React.PureComponent<Actions> {
  render() {
    return (
      <ActionsPanel>
        <Button
          buttonType="secondary"
          onClick={this.props.cancel}
          data-qa-cancel
        >
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={this.props.executePayment}
          loading={this.props.isMakingPayment}
          data-qa-submit
          data-testid="credit-card-submit"
        >
          Confirm Payment
        </Button>
      </ActionsPanel>
    );
  }
}

import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import { Notice } from 'src/components/Notice/Notice';

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

type CombinedProps = Props;

const CreditCardDialog: React.SFC<CombinedProps> = (props) => {
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

export default compose<CombinedProps, Props>(React.memo)(CreditCardDialog);

class DialogActions extends React.PureComponent<Actions> {
  render() {
    return (
      <ActionsPanel
        primary
        primaryButtonDataTestId="submit"
        primaryButtonHandler={this.props.executePayment}
        primaryButtonLoading={this.props.isMakingPayment}
        primaryButtonText="Confirm Payment"
        secondary
        secondaryButtonDataTestId="cancel"
        secondaryButtonHandler={this.props.cancel}
        secondaryButtonText="Cancel"
      />
    );
  }
}

import * as React from 'react';
import { compose } from 'recompose';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';

interface Actions {
  executePayment: () => void;
  cancel: () => void;
  isMakingPayment: boolean;
}

interface Props extends Actions {
  open: boolean;
  usd: string;
}

type CombinedProps = Props;

const CreditCardDialog: React.SFC<CombinedProps> = props => {
  const { cancel, open, usd, ...actionsProps } = props;

  return (
    <ConfirmationDialog
      open={open}
      title="Confirm Payment"
      onClose={cancel}
      actions={<DialogActions {...actionsProps} cancel={cancel} />}
    >
      <Typography>{`Confirm payment of $${usd} USD to Linode LLC?`}</Typography>
    </ConfirmationDialog>
  );
};

export default compose<CombinedProps, Props>(React.memo)(CreditCardDialog);

class DialogActions extends React.PureComponent<Actions> {
  render() {
    return (
      <ActionsPanel>
        <Button type="cancel" onClick={this.props.cancel} data-qa-cancel>
          Cancel
        </Button>
        <Button
          type="secondary"
          loading={this.props.isMakingPayment}
          onClick={this.props.executePayment}
          data-qa-submit
        >
          Confirm Payment
        </Button>
      </ActionsPanel>
    );
  }
}

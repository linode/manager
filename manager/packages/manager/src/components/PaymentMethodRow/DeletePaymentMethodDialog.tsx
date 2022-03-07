import * as React from 'react';
import ActionsPanel from '../ActionsPanel';
import Button from '../Button';
import Dialog from 'src/components/ConfirmationDialog';
import { PaymentMethod } from '@linode/api-v4/lib/account/types';
import CreditCard from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';
import ThirdPartyPayment from './ThirdPartyPayment';
import Grid from '../Grid';
import { makeStyles, Theme } from '../core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  item: {
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    flexWrap: 'nowrap',
    marginTop: theme.spacing(1),
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  loading: boolean;
  error: string | undefined;
  paymentMethod: PaymentMethod | undefined;
}

export const DeletePaymentMethodDialog: React.FC<Props> = (props) => {
  const { open, onClose, loading, onDelete, error, paymentMethod } = props;
  const classes = useStyles();

  const actions = (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button buttonType="primary" onClick={onDelete} loading={loading}>
        Delete
      </Button>
    </ActionsPanel>
  );

  return (
    <Dialog
      title="Delete Payment Method"
      error={error}
      open={open}
      onClose={onClose}
      actions={actions}
    >
      Are you sure you want to delete this payment method?
      <Grid container className={classes.container}>
        <Grid
          item
          className={classes.item}
          style={{ paddingLeft: 0, paddingBottom: 0 }}
        >
          {paymentMethod && paymentMethod.type === 'credit_card' ? (
            <CreditCard creditCard={paymentMethod.data} />
          ) : paymentMethod ? (
            <ThirdPartyPayment paymentMethod={paymentMethod} />
          ) : null}
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default React.memo(DeletePaymentMethodDialog);

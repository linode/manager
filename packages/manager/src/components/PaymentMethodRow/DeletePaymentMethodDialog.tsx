import { PaymentMethod } from '@linode/api-v4/lib/account/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import CreditCard from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';
import ActionsPanel from '../ActionsPanel';
import Button from '../Button';
import Grid from '../Grid';
import ThirdPartyPayment from './ThirdPartyPayment';

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
    <ConfirmationDialog
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
    </ConfirmationDialog>
  );
};

export default React.memo(DeletePaymentMethodDialog);

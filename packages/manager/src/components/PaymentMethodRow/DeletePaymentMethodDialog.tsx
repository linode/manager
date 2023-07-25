import { PaymentMethod } from '@linode/api-v4/lib/account/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import CreditCard from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';

import { ActionsPanel } from '../ActionsPanel/ActionsPanel';
import Grid from '../Grid';
import ThirdPartyPayment from './ThirdPartyPayment';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    flexWrap: 'nowrap',
    marginTop: theme.spacing(1),
  },
  item: {
    alignItems: 'center',
    display: 'flex',
  },
}));

interface Props {
  error: string | undefined;
  loading: boolean;
  onClose: () => void;
  onDelete: () => void;
  open: boolean;
  paymentMethod: PaymentMethod | undefined;
}

export const DeletePaymentMethodDialog: React.FC<Props> = (props) => {
  const { error, loading, onClose, onDelete, open, paymentMethod } = props;
  const classes = useStyles();

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        label: 'Delete',
        loading,
        onClick: onDelete,
      }}
      secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
      style={{ padding: 0 }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error}
      onClose={onClose}
      open={open}
      title="Delete Payment Method"
    >
      Are you sure you want to delete this payment method?
      <Grid className={classes.container} container>
        <Grid
          className={classes.item}
          item
          style={{ paddingBottom: 0, paddingLeft: 0 }}
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

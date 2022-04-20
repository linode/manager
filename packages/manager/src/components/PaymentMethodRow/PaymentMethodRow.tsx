import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { PaymentMethod } from '@linode/api-v4/lib/account/types';
import { makeStyles, Theme } from 'src/components/core/styles';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import Chip from 'src/components/core/Chip';
import CreditCard from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';
import ThirdPartyPayment from './ThirdPartyPayment';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { makeDefaultPaymentMethod } from '@linode/api-v4/lib';
import { useSnackbar } from 'notistack';
import { queryClient } from 'src/queries/base';
import { queryKey } from 'src/queries/accountPayment';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(),
    padding: 0,
  },
  actions: {
    marginLeft: 'auto',
    '& button': {
      margin: 0,
    },
  },
  item: {
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    flexWrap: 'nowrap',
  },
}));

interface Props {
  paymentMethod: PaymentMethod;
  onDelete: () => void;
}

const PaymentMethodRow: React.FC<Props> = (props) => {
  const { paymentMethod, onDelete } = props;
  const { type, is_default } = paymentMethod;
  const classes = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const makeDefault = (id: number) => {
    makeDefaultPaymentMethod(id)
      .then(() => queryClient.invalidateQueries(`${queryKey}-all`))
      .catch((errors) =>
        enqueueSnackbar(
          errors[0]?.reason || 'Unable to change your default payment method.',
          { variant: 'error' }
        )
      );
  };

  const actions: Action[] = [
    {
      title: 'Make a Payment',
      onClick: () => {
        history.push({
          pathname: '/account/billing/make-payment/',
          state: { paymentMethod },
        });
      },
    },
    {
      title: 'Make Default',
      disabled: paymentMethod.is_default,
      tooltip: paymentMethod.is_default
        ? 'This is already your default payment method.'
        : undefined,
      onClick: () => makeDefault(paymentMethod.id),
    },
    {
      title: 'Delete',
      disabled: paymentMethod.is_default,
      tooltip: paymentMethod.is_default
        ? 'You cannot remove this payment method without setting a new default first.'
        : undefined,
      onClick: onDelete,
    },
  ];

  const getActionMenuAriaLabel = (paymentMethod: PaymentMethod) => {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (paymentMethod.type) {
      case 'paypal':
        return `Action menu for Paypal ${paymentMethod.data.email}`;
      default:
        return `Action menu for card ending in ${paymentMethod.data.last_four}`;
    }
  };

  return (
    <Paper
      className={classes.root}
      variant="outlined"
      data-testid={`payment-method-row-${paymentMethod.id}`}
      data-qa-payment-row={type}
    >
      <Grid container className={classes.container}>
        <Grid item className={classes.item}>
          {paymentMethod.type === 'credit_card' ? (
            <CreditCard creditCard={paymentMethod.data} />
          ) : (
            <ThirdPartyPayment paymentMethod={paymentMethod} />
          )}
        </Grid>
        <Grid item className={classes.item} style={{ paddingRight: 0 }}>
          {is_default && <Chip label="DEFAULT" component="span" size="small" />}
        </Grid>
        <Grid item className={classes.actions}>
          <ActionMenu
            actionsList={actions}
            ariaLabel={getActionMenuAriaLabel(paymentMethod)}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PaymentMethodRow;

import * as React from 'react';
import { useHistory } from 'react-router-dom';
import {
  PaymentMethod,
  ThirdPartyPayment as ThirdPartyPaymentTypes,
} from '@linode/api-v4/lib/account/types';
import { makeStyles, Theme } from 'src/components/core/styles';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import Chip from 'src/components/core/Chip';
import CreditCard from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';
import ThirdPartyPayment, { thirdPartyPaymentMap } from './ThirdPartyPayment';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { makeDefaultPaymentMethod } from '@linode/api-v4/lib';
import { useSnackbar } from 'notistack';
import { queryClient } from 'src/queries/base';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(),
    padding: 0,
  },
  actions: {
    marginLeft: 'auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
  },
  chip: {
    fontSize: '0.625rem',
  },
  container: {
    flexWrap: 'nowrap',
  },
}));

interface Props {
  paymentMethod: PaymentMethod;
  onEdit?: () => void;
}

const PaymentMethodRow: React.FC<Props> = (props) => {
  const { paymentMethod, onEdit } = props;
  const { data, type, is_default } = paymentMethod;
  const classes = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const makeDefault = async (id: number) => {
    try {
      await makeDefaultPaymentMethod(id);

      queryClient.setQueryData(
        'account-payment-methods-all',
        (oldData: PaymentMethod[]) => {
          const otherPaymentMethods = oldData
            .filter((method: PaymentMethod) => method.id !== paymentMethod.id)
            .map((method) => (method.is_default = false));

          return [
            ...otherPaymentMethods,
            {
              ...paymentMethod,
              is_default: true,
            },
          ];
        }
      );
    } catch (errors) {
      enqueueSnackbar(
        errors[0].reason ||
          `Unable to make your ${paymentMethod.type} default.`,
        { variant: 'error' }
      );
    }
  };

  const actions: Action[] = [
    {
      title: 'Make a Payment',
      onClick: () => {
        history.replace('/account/billing/make-payment');
      },
    },
    {
      title: 'Make Default',
      disabled: paymentMethod.is_default,
      tooltip: paymentMethod.is_default
        ? 'This is already your default payment method'
        : undefined,
      onClick: () => makeDefault(paymentMethod.id),
    },
    ...(onEdit
      ? [
          {
            title: 'Edit',
            onClick: onEdit,
          },
        ]
      : []),
  ];

  return (
    <Paper className={classes.root} variant="outlined">
      <Grid container className={classes.container}>
        <Grid item className={classes.item}>
          {paymentMethod.type === 'credit_card' ? (
            <CreditCard
              type={data?.card_type}
              lastFour={data?.last_four}
              expiry={data?.expiry}
            />
          ) : (
            <ThirdPartyPayment
              thirdPartyPayment={type as ThirdPartyPaymentTypes}
            />
          )}
        </Grid>
        <Grid item className={classes.item}>
          {is_default && (
            <Chip className={classes.chip} label="DEFAULT" component="span" />
          )}
        </Grid>
        <Grid item className={classes.actions}>
          <ActionMenu
            actionsList={actions}
            ariaLabel={`Action menu for ${
              type === 'credit_card'
                ? `card ending in ${data?.last_four}`
                : thirdPartyPaymentMap[type]?.label
            }`}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PaymentMethodRow;

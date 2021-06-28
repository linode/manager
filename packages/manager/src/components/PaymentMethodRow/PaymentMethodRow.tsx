import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import Chip from 'src/components/core/Chip';
import ActionMenu, {
  Action,
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import CreditCard from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';
import ThirdPartyPayment, { thirdPartyPaymentMap } from './ThirdPartyPayment';
import {
  PaymentMethod,
  ThirdPartyPayment as ThirdPartyPaymentTypes,
} from '@linode/api-v4/lib/account/types';
import { useHistory } from 'react-router-dom';

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

type CombinedProps = Props;

const PaymentMethodRow: React.FC<CombinedProps> = (props) => {
  const { paymentMethod, onEdit } = props;
  const { data, type, is_default } = paymentMethod;
  const classes = useStyles();
  const history = useHistory();

  const actions: Action[] = [
    {
      title: 'Make a Payment',
      onClick: () => {
        history.replace('/account/billing/make-payment');
      },
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

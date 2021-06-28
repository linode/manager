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
  ThirdPartyPayment as ThirdPartyPaymentType,
  CreditCard as CreditCardType,
} from '@linode/api-v4/lib/account/types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: '4px',
    height: '52px',
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
}));

interface Props {
  creditCard?: CreditCardType;
  thirdPartyPayment?: ThirdPartyPaymentType;
  isDefault: boolean;
}

type CombinedProps = Props;

const PaymentMethodRow: React.FC<CombinedProps> = (props) => {
  const { creditCard, thirdPartyPayment, isDefault } = props;
  const classes = useStyles();

  const actions: Action[] = [
    {
      title: 'Make a Payment',
      onClick: () => {
        ('');
      },
    },
    {
      title: 'Make Default',
      disabled: isDefault,
      onClick: () => {
        ('');
      },
    },
    {
      title: 'Edit',
      onClick: () => {
        ('');
      },
    },
    {
      title: 'Remove',
      onClick: () => {
        ('');
      },
    },
  ];

  return (
    <Paper className={classes.root} variant="outlined">
      <Grid container>
        <Grid item className={classes.item}>
          {thirdPartyPayment ? (
            <ThirdPartyPayment thirdPartyPayment={thirdPartyPayment} />
          ) : null}
          {creditCard ? (
            <CreditCard
              type={creditCard.card_type}
              lastFour={creditCard.last_four}
              expiry={creditCard.expiry}
            />
          ) : null}
        </Grid>
        <Grid item className={classes.item}>
          {isDefault && (
            <Chip className={classes.chip} label="DEFAULT" component="span" />
          )}
        </Grid>
        <Grid item className={classes.actions}>
          <ActionMenu
            actionsList={actions}
            ariaLabel={`Action menu for ${
              creditCard?.last_four
                ? `card ending in ${creditCard.last_four}`
                : thirdPartyPayment &&
                  thirdPartyPaymentMap[thirdPartyPayment].label
            }`}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PaymentMethodRow;

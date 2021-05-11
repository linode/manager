import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import isCreditCardExpired from 'src/utilities/isCreditCardExpired';
import Chip from 'src/components/core/Chip';
import ActionMenu, {
  Action,
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import Typography from 'src/components/core/Typography';
import Visa from 'src/assets/icons/paymentCards/visaBlue.svg';
import Mastercard from 'src/assets/icons/paymentCards/mastercard.svg';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(),
  },
  expiry: {
    marginLeft: theme.spacing(),
    [theme.breakpoints.down('xs')]: {
      marginLeft: '0',
    },
  },
  expired: {
    color: theme.color.red,
  },
  actions: {
    marginLeft: 'auto',
  },
  card: {
    display: 'flex',
    [theme.breakpoints.down('xs')]: {
      display: 'grid',
    },
  },
  item: {
    display: 'flex',
    alignItems: 'center',
  },
  paymentMethod: {
    fontWeight: 'bold',
  },
  mastercard: {
    paddingLeft: '5px',
    marginLeft: '2px',
    marginRight: '5px',
  },
}));

interface Props {
  lastFour?: string;
  expiry?: string;
  isDefault?: boolean;
  paymentMethod?: string;
}

type CombinedProps = Props;

const PaymentMethodRow: React.FC<CombinedProps> = (props) => {
  const { expiry, lastFour, isDefault, paymentMethod } = props;
  const classes = useStyles();
  const isCardExpired = expiry && isCreditCardExpired(expiry);

  const renderPaymentMethodIcon = (paymentMethod: string | undefined): any => {
    switch (paymentMethod) {
      case 'Visa':
        return <Visa />;
      case 'Mastercard':
        return <Mastercard className={classes.mastercard} />;
    }
  };

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
    <Paper className={classes.root} border>
      <Grid container>
        <Grid item className={classes.item}>
          {renderPaymentMethodIcon(paymentMethod)}
          <Grid item className={classes.card}>
            <Typography className={classes.paymentMethod}>
              &nbsp;{paymentMethod} ****{lastFour}
            </Typography>
            <Typography className={classes.expiry}>
              {isCardExpired ? (
                <span className={classes.expired}>
                  &nbsp;{`Expired ${expiry}`}
                </span>
              ) : (
                <span>&nbsp;{`Expires ${expiry}`}</span>
              )}
            </Typography>
          </Grid>
        </Grid>
        <Grid item className={classes.item}>
          {isDefault && <Chip label="Default" component="span" />}
        </Grid>
        <Grid item className={classes.actions}>
          <ActionMenu
            actionsList={actions}
            ariaLabel={`Action menu for card ending in ${lastFour}`}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(PaymentMethodRow);

import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import PaymentMethodRow from 'src/components/PaymentMethodRow';
import styled from 'src/containers/SummaryPanels.styles';
import AddPaymentMethodDrawer from './AddPaymentMethodDrawer';
import CreditCard from './CreditCard';
import UpdateCreditCardDrawer from './UpdateCreditCardDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  root: {
    display: 'flex',
  },
  summarySectionHeight: {
    flex: '0 1 auto',
    width: '100%',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  billingGroup: {
    marginBottom: theme.spacing(3),
  },
  edit: {
    color: theme.cmrTextColors.linkActiveLight,
    fontFamily: theme.font.normal,
    fontSize: '.875rem',
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(1),
    minWidth: 'auto',
    padding: 0,
    '&:hover, &:focus': {
      backgroundColor: 'transparent',
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
  },
}));

interface Props {
  balanceUninvoiced: number;
  balance: number;
  expiry: string;
  lastFour: string;
  promoCredit?: string;
}

type CombinedProps = Props;

const PaymentInformation: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { lastFour, expiry } = props;

  const [addDrawerOpen, setAddDrawerOpen] = React.useState<boolean>(false);
  const [editDrawerOpen, setEditDrawerOpen] = React.useState<boolean>(false);

  const handleOpenEditDrawer = () => {
    setEditDrawerOpen(true);
  };

  const handleOpenAddDrawer = () => {
    setAddDrawerOpen(true);
  };

  const paymentMethods = [
    {
      data: {
        card_type: 'Discover',
        expiry: '12/2022',
        last_four: '1111',
      },
      is_default: 0,
      created: '2021-06-01T20:14:49',
      method: 'google_pay',
    },
    {
      created: '2021-05-24T15:49:49',
      method: 'credit_card',
      is_default: 1,
      data: {
        expiry: '09/2027',
        card_type: '',
        last_four: '0061',
      },
    },
  ];

  return (
    <Grid className={classes.root} item xs={12} md={6}>
      <Paper
        className={`${classes.summarySection} ${classes.summarySectionHeight}`}
        data-qa-billing-summary
      >
        <div className={classes.container}>
          <Typography variant="h3" className={classes.title}>
            Payment Method
          </Typography>
          <Button className={classes.edit} onClick={handleOpenAddDrawer}>
            Add a Payment Method
          </Button>
          {/* <Button className={classes.edit} onClick={handleOpenDrawer}>
            Edit
          </Button> */}
        </div>

        {/* <CreditCard lastFour={lastFour} expiry={expiry} /> */}

        {paymentMethods.map((paymentMethod) => (
          <PaymentMethodRow
            key={paymentMethod.method}
            paymentMethod={paymentMethod.data.card_type}
            isDefault={Boolean(paymentMethod.is_default)}
            expiry={paymentMethod.data.expiry}
            lastFour={paymentMethod.data.last_four}
          />
        ))}

        <UpdateCreditCardDrawer
          open={editDrawerOpen}
          onClose={() => setEditDrawerOpen(false)}
        />
        <AddPaymentMethodDrawer
          open={addDrawerOpen}
          onClose={() => setAddDrawerOpen(false)}
        />
      </Paper>
    </Grid>
  );
};

export default compose<CombinedProps, Props>(React.memo)(PaymentInformation);

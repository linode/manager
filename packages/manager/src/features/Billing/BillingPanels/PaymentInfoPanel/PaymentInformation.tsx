import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import PaymentMethodRow from 'src/components/PaymentMethodRow';
import styled from 'src/containers/SummaryPanels.styles';
import AddPaymentMethodDrawer from './AddPaymentMethodDrawer';
import UpdateCreditCardDrawer from './UpdateCreditCardDrawer';
import GooglePay from 'src/assets/icons/providers/google-logo.svg';
import Box from 'src/components/core/Box';
import useFlags from 'src/hooks/useFlags';

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
  googlePayNotice: {
    marginLeft: theme.spacing(),
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

const PaymentInformation: React.FC<Props> = (props) => {
  const classes = useStyles();
  const flags = useFlags();
  const isGooglePayEnabled = flags.additionalPaymentMethods?.includes(
    'google_pay'
  );
  // const { lastFour, expiry } = props;

  const [addDrawerOpen, setAddDrawerOpen] = React.useState<boolean>(false);
  const [editDrawerOpen, setEditDrawerOpen] = React.useState<boolean>(false);

  // const handleOpenEditDrawer = () => {
  //   setEditDrawerOpen(true);
  // };

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
      is_default: false,
      created: '2021-06-01T20:14:49',
      method: 'google_pay',
    },
    {
      created: '2021-05-24T15:49:49',
      method: 'credit_card',
      is_default: true,
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

          {isGooglePayEnabled ? (
            <Button className={classes.edit} onClick={handleOpenAddDrawer}>
              Add a Payment Method
            </Button>
          ) : null}
        </div>

        {paymentMethods.map((paymentMethod) => (
          <PaymentMethodRow
            key={paymentMethod.method}
            paymentMethod={paymentMethod.data.card_type}
            isDefault={paymentMethod.is_default}
            expiry={paymentMethod.data.expiry}
            lastFour={paymentMethod.data.last_four}
          />
        ))}

        {isGooglePayEnabled ? (
          <Box display="flex" alignItems="center">
            <GooglePay width={16} height={16} />
            <Typography className={classes.googlePayNotice}>
              Google Pay is now available for recurring payments.
              <Link to="#" onClick={() => setAddDrawerOpen(true)}>
                {' '}
                Add Payment Method.
              </Link>
            </Typography>
          </Box>
        ) : null}

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

import { ActivePromotion } from '@linode/api-v4/lib/account/types';
import * as classnames from 'classnames';
import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import HelpIcon from 'src/components/HelpIcon';
import PaymentDrawer from './PaymentDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: 0,
    marginBottom: 20,
  },
  paper: {
    padding: `15px 20px`,
  },
  divider: {
    marginTop: 8,
    backgroundColor: '#d6d7d9',
  },
  helpIcon: {
    padding: `0px 8px`,
    color: '#888f91',
  },
  neutralBalance: {
    color: theme.palette.text.primary,
  },
  positiveBalance: {
    color: theme.cmrIconColors.iRed,
  },
  credit: {
    color: '#02b159',
  },
  text: {
    color: '#606469',
  },
  accruedCharges: {
    color: theme.palette.text.primary,
  },
  header: {
    marginBottom: theme.spacing(2) - 1,
  },
  unpaidBalance: {
    marginBottom: theme.spacing(1) + 2,
    fontSize: 32,
    color: '#cf1e1e',
  },
  gridItem: {
    padding: `0 0 ${theme.spacing(3) + 1}px`,
    [theme.breakpoints.up('md')]: {
      padding: `0 ${theme.spacing(4) - 2}px`,
    },
    '&:first-of-type': {
      [theme.breakpoints.up('md')]: {
        paddingLeft: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
    },
    '&:nth-of-type(2)': {
      [theme.breakpoints.up('md')]: {
        borderLeft: `1px solid ${theme.cmrBorderColors.borderBillingSummary}`,
      },
    },
    '&:last-of-type': {
      paddingBottom: 0,
      [theme.breakpoints.up('md')]: {
        paddingRight: 0,
      },
    },
  },
  balanceOuter: {
    paddingTop: theme.spacing(1) - 3,
    borderTop: `1px dashed ${theme.cmrBorderColors.borderBalance}`,
  },
  label: {
    margin: `${theme.spacing(1) - 3}px 0`,
    fontWeight: 'bold',
    color: theme.color.headline,
    fontSize: '1rem',
    letterSpacing: 0.07,
    lineHeight: 1.25,
  },
  field: {
    margin: `${theme.spacing(1) - 3}px 0`,
    color: `${theme.color.headline}`,
    fontSize: '1rem',
    lineHeight: 1.13,
  },
  caption: {
    marginTop: theme.spacing(1) + 2,
    textAlign: 'right',
  },
  // text: {
  //   lineHeight: 1.43,
  //   letterSpacing: 0.1,
  //   color: theme.color.billingText,
  // },
  iconButtonOuter: {
    display: 'flex',
    justifyContent: 'space-between',
    '& button, & a': {
      justifyContent: 'flex-start',
    },
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
    },
    [theme.breakpoints.only('xs')]: {
      flexDirection: 'column',
    },
    [theme.breakpoints.only('md')]: {
      flexDirection: 'column',
    },
  },
  invoiceButton: {
    [theme.breakpoints.only('sm')]: {
      paddingLeft: 32,
    },
    '& button': {
      paddingLeft: '0',
    },
  },
  iconButton: {
    paddingLeft: 0,
    [theme.breakpoints.up('md')]: {
      paddingBottom: 0,
    },
    '&:hover': {
      textDecoration: 'none',
      '& svg': {
        color: `${theme.palette.primary.main} !important`,
      },
    },
    '&:focus': {
      textDecoration: 'none',
    },
  },
  infoIcon: {
    padding: `0px ${theme.spacing(1) + 2}px`,
    top: -2,
  },
}));

interface Props {
  promotions?: ActivePromotion[];
  balanceUninvoiced: number;
  balance: number;
  mostRecentInvoiceId?: number;
}

export const BillingSummary: React.FC<Props> = (props) => {
  const { promotions, balanceUninvoiced, balance } = props;

  // On-the-fly route matching so this component can open the drawer itself.
  const makePaymentRouteMatch = Boolean(
    useRouteMatch('/account/billing/make-payment')
  );

  const { replace } = useHistory();

  const [paymentDrawerOpen, setPaymentDrawerOpen] = React.useState<boolean>(
    false
  );

  const openPaymentDrawer = React.useCallback(
    () => setPaymentDrawerOpen(true),
    []
  );

  const closePaymentDrawer = React.useCallback(() => {
    setPaymentDrawerOpen(false);
    replace('/account/billing');
  }, [replace]);

  React.useEffect(() => {
    if (makePaymentRouteMatch) {
      openPaymentDrawer();
    }
  }, [makePaymentRouteMatch, openPaymentDrawer]);

  const classes = useStyles();

  let accountBalanceText = 'You have no balance at this time.';
  if (balance > 0) {
    accountBalanceText = 'Payment Overdue';
  }
  if (balance < 0) {
    accountBalanceText = 'Credit';
  }

  return (
    <>
      <Grid container spacing={3} className={classes.root}>
        <Grid item xs={12} md={4}>
          <Paper className={classes.paper}>
            <Box display="flex" alignItems="center">
              <Typography variant="h3">Account Balance</Typography>
              <HelpIcon
                className={classes.helpIcon}
                text="Some helper text about account balance."
              />
            </Box>
            <Divider className={classes.divider} />
            <Box
              marginTop="12px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant={balance === 0 ? 'body1' : 'h3'}
                style={{ marginRight: 8 }}
                className={classnames({
                  [classes.neutralBalance]: balance === 0,
                  [classes.positiveBalance]: balance > 0,
                  [classes.credit]: balance < 0,
                })}
              >
                {accountBalanceText}
              </Typography>
              <Typography
                variant="h3"
                className={classnames({
                  [classes.neutralBalance]: balance === 0,
                  [classes.positiveBalance]: balance > 0,
                  [classes.credit]: balance < 0,
                })}
              >
                <Currency quantity={Math.abs(balance)} />
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className={classes.paper}>
            <Box display="flex" alignItems="center">
              <Typography variant="h3">Promotions</Typography>
              <HelpIcon
                className={classes.helpIcon}
                text="Some helper text about promotions."
              />
            </Box>
            <Divider className={classes.divider} />
            {promotions?.map((thisPromo) => (
              <PromoDisplay key={thisPromo.summary} {...thisPromo} />
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className={classes.paper}>
            <Box display="flex" alignItems="center">
              <Typography variant="h3">Accrued Charges</Typography>
              <HelpIcon
                className={classes.helpIcon}
                text="Some helper text about accrued charges."
              />
            </Box>
            <Divider className={classes.divider} />
            <Box
              marginTop="12px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography>Since last invoice</Typography>
              <Typography variant="h3" className={classes.accruedCharges}>
                <Currency quantity={balanceUninvoiced} />
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <PaymentDrawer open={paymentDrawerOpen} onClose={closePaymentDrawer} />
    </>
  );
};

export default React.memo(BillingSummary);

export type PromoDisplayProps = ActivePromotion;

export const PromoDisplay: React.FC<PromoDisplayProps> = (props) => {
  const classes = useStyles();

  const { summary, description, credit_remaining, expire_dt } = props;
  return (
    <Box marginTop="12px">
      <Box display="flex" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Typography variant="h3" className={classes.text}>
            {summary}
          </Typography>
          <HelpIcon className={classes.helpIcon} text={description} />
        </Box>
        <Typography variant="h3" className={classes.credit}>
          <Currency quantity={Number.parseFloat(credit_remaining)} /> remaining
        </Typography>
      </Box>
      {expire_dt ? (
        <Typography>
          Expires <DateTimeDisplay value={expire_dt} />
        </Typography>
      ) : null}
    </Box>
  );
};

import { PaymentMethod } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import PaymentMethodRow from 'src/components/PaymentMethodRow';
import styled from 'src/containers/SummaryPanels.styles';
import useFlags from 'src/hooks/useFlags';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import AddPaymentMethodDrawer from './AddPaymentMethodDrawer';
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
  loading: {
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  billingGroup: {
    marginBottom: theme.spacing(3),
  },
  googlePayNoticeContainer: {
    fontSize: '0.875rem',
    marginTop: theme.spacing(2),
    padding: `8px 0px`,
    '& button': {
      marginLeft: theme.spacing(),
    },
    '& p': {
      fontSize: '0.875rem',
      marginLeft: 0,
    },
  },
  googlePayIcon: {
    flexShrink: 0,
    height: 20,
    marginRight: theme.spacing(),
  },
  edit: {
    color: theme.cmrTextColors.linkActiveLight,
    fontFamily: theme.font.normal,
    fontSize: '.875rem',
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    minHeight: 0,
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
  loading: boolean;
  error?: APIError[] | null;
  paymentMethods: PaymentMethod[] | undefined;
}

const PaymentInformation: React.FC<Props> = (props) => {
  const { loading, error, paymentMethods } = props;
  const [addDrawerOpen, setAddDrawerOpen] = React.useState<boolean>(false);
  const [editDrawerOpen, setEditDrawerOpen] = React.useState<boolean>(false);

  const classes = useStyles();
  const flags = useFlags();
  const { replace } = useHistory();

  const drawerLink = '/account/billing/add-payment-method';
  const addPaymentMethodRouteMatch = Boolean(useRouteMatch(drawerLink));

  const isGooglePayEnabled = flags.additionalPaymentMethods?.includes(
    'google_pay'
  );

  const showAddPaymentMethodButton =
    paymentMethods?.length === 0 ||
    isGooglePayEnabled ||
    (!isGooglePayEnabled &&
      !paymentMethods?.some(
        (method: PaymentMethod) => method.type === 'credit_card'
      ));

  const showGooglePayAvailableNotice =
    isGooglePayEnabled &&
    !paymentMethods?.some(
      (paymetMethod: PaymentMethod) => paymetMethod.type === 'google_pay'
    );

  const openAddDrawer = React.useCallback(() => setAddDrawerOpen(true), []);

  const closeAddDrawer = React.useCallback(() => {
    setAddDrawerOpen(false);
    replace('/account/billing');
  }, [replace]);

  const openEditDrawer = () => {
    setEditDrawerOpen(true);
  };

  const closeEditDrawer = () => {
    setEditDrawerOpen(false);
  };

  React.useEffect(() => {
    if (addPaymentMethodRouteMatch) {
      openAddDrawer();
    }
  }, [addPaymentMethodRouteMatch, openAddDrawer]);

  return (
    <Grid className={classes.root} item xs={12} md={6}>
      <Paper
        className={`${classes.summarySection} ${classes.summarySectionHeight}`}
        data-qa-billing-summary
      >
        <div className={classes.container}>
          <Typography variant="h3" className={classes.title}>
            Payment Methods
          </Typography>
          {showAddPaymentMethodButton ? (
            <Button
              className={classes.edit}
              onClick={() => replace(drawerLink)}
            >
              Add Payment Method
            </Button>
          ) : null}
        </div>
        {loading ? (
          <Grid className={classes.loading}>
            <CircleProgress mini />
          </Grid>
        ) : error ? (
          <Typography>
            {
              getAPIErrorOrDefault(
                error,
                'There was an error retrieving your payment methods.'
              )[0].reason
            }
          </Typography>
        ) : !paymentMethods || paymentMethods?.length == 0 ? (
          <Typography>
            No payment methods have been specified for this account.
          </Typography>
        ) : (
          paymentMethods.map((paymentMethod: PaymentMethod) => (
            <PaymentMethodRow
              key={paymentMethod.type}
              paymentMethod={paymentMethod}
              onEdit={
                paymentMethod.type === 'credit_card'
                  ? openEditDrawer
                  : undefined
              }
            />
          ))
        )}
        {showGooglePayAvailableNotice ? (
          <DismissibleBanner
            className={classes.googlePayNoticeContainer}
            preferenceKey="google-pay-available-notification"
          >
            <Box display="flex" alignItems="center">
              <GooglePayIcon className={classes.googlePayIcon} />
              <Typography>
                Google Pay is now available for recurring payments.{' '}
                <Link to="#" onClick={() => replace(drawerLink)}>
                  Add Google Pay
                </Link>
              </Typography>
            </Box>
          </DismissibleBanner>
        ) : null}
        <UpdateCreditCardDrawer
          open={editDrawerOpen}
          onClose={closeEditDrawer}
        />
        <AddPaymentMethodDrawer
          open={addDrawerOpen}
          onClose={closeAddDrawer}
          paymentMethods={paymentMethods}
        />
      </Paper>
    </Grid>
  );
};

export default React.memo(PaymentInformation);

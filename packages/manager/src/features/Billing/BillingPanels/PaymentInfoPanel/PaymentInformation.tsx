import { PaymentMethod } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import GooglePay from 'src/assets/icons/providers/google-logo.svg';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
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
  error?: APIError[] | null;
  paymentMethods: PaymentMethod[] | undefined;
}

const PaymentInformation: React.FC<Props> = (props) => {
  const { paymentMethods, error } = props;
  const [addDrawerOpen, setAddDrawerOpen] = React.useState<boolean>(false);
  const [editDrawerOpen, setEditDrawerOpen] = React.useState<boolean>(false);

  const classes = useStyles();
  const flags = useFlags();

  const isGooglePayEnabled = flags.additionalPaymentMethods?.includes(
    'google_pay'
  );

  const openAddDrawer = () => {
    setAddDrawerOpen(true);
  };

  const openEditDrawer = () => {
    setEditDrawerOpen(true);
  };

  const closeAddDrawer = () => {
    setAddDrawerOpen(false);
  };

  const closeEditDrawer = () => {
    setEditDrawerOpen(false);
  };

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

          {isGooglePayEnabled ? (
            <Button className={classes.edit} onClick={openAddDrawer}>
              Add Payment Method
            </Button>
          ) : null}
        </div>
        {error ? (
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
        {isGooglePayEnabled &&
        !paymentMethods?.some(
          (paymetMethod: PaymentMethod) => paymetMethod.type === 'google_pay'
        ) ? (
          <Box display="flex" alignItems="center" mt={3}>
            <GooglePay width={16} height={16} />
            <Typography className={classes.googlePayNotice}>
              Google Pay is now available for recurring payments.{' '}
              <Link to="#" onClick={openAddDrawer}>
                Add Google Pay
              </Link>
            </Typography>
          </Box>
        ) : null}
        <UpdateCreditCardDrawer
          open={editDrawerOpen}
          onClose={closeEditDrawer}
        />
        <AddPaymentMethodDrawer open={addDrawerOpen} onClose={closeAddDrawer} />
      </Paper>
    </Grid>
  );
};

export default React.memo(PaymentInformation);

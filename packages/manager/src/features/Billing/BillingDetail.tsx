import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import { useAccount } from 'src/queries/account';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import BillingActivityPanel from './BillingPanels/BillingActivityPanel/BillingActivityPanel';
import BillingSummary from './BillingPanels/BillingSummary';
import ContactInfo from './BillingPanels/ContactInfoPanel';
import PaymentInformation from './BillingPanels/PaymentInfoPanel';
import { useAllPaymentMethodsQuery } from 'src/queries/accountPayment';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { PAYPAL_CLIENT_ID } from 'src/constants';

const useStyles = makeStyles()((theme: Theme) => ({
  main: {
    [theme.breakpoints.up('md')]: {
      order: 1,
    },
  },
  heading: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
}));

export const BillingDetail = () => {
  const {
    data: paymentMethods,
    isLoading: paymentMethodsLoading,
    error: paymentMethodsError,
  } = useAllPaymentMethodsQuery();

  const {
    data: account,
    error: accountError,
    isLoading: accountLoading,
  } = useAccount();

  const { classes } = useStyles();

  if (accountLoading) {
    return <CircleProgress />;
  }

  if (accountError) {
    const errorText = getAPIErrorOrDefault(
      accountError,
      'There was an error retrieving your account data.'
    )[0].reason;
    return <ErrorState errorText={errorText} />;
  }

  if (!account) {
    return null;
  }

  return (
    <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
      <DocumentTitleSegment segment={`Account & Billing`} />
      <div data-testid="billing-detail">
        <Grid container>
          <Grid item xs={12} md={12} lg={12} className={classes.main}>
            <BillingSummary
              paymentMethods={paymentMethods}
              balance={account?.balance ?? 0}
              promotions={account?.active_promotions}
              balanceUninvoiced={account?.balance_uninvoiced ?? 0}
            />
            <Grid container direction="row">
              <ContactInfo
                company={account.company}
                firstName={account.first_name}
                lastName={account.last_name}
                address1={account.address_1}
                address2={account.address_2}
                city={account.city}
                state={account.state}
                zip={account.zip}
                country={account.country}
                email={account.email}
                phone={account.phone}
                taxId={account.tax_id}
              />
              <PaymentInformation
                loading={paymentMethodsLoading}
                error={paymentMethodsError}
                paymentMethods={paymentMethods}
                isAkamaiCustomer={account?.billing_source === 'akamai'}
              />
            </Grid>
            <BillingActivityPanel accountActiveSince={account?.active_since} />
          </Grid>
        </Grid>
      </div>
    </PayPalScriptProvider>
  );
};

export default BillingDetail;

import {
  useAccount,
  useAllPaymentMethodsQuery,
  useProfile,
} from '@linode/queries';
import { Button, CircleProgress, ErrorState } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { PAYPAL_CLIENT_ID } from 'src/constants';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { BillingActivityPanel } from './BillingPanels/BillingActivityPanel/BillingActivityPanel';
import BillingSummary from './BillingPanels/BillingSummary';
import { ContactInformation } from './BillingPanels/ContactInfoPanel/ContactInformation';
import PaymentInformation from './BillingPanels/PaymentInfoPanel';

export const BillingDetail = () => {
  const {
    data: paymentMethods,
    error: paymentMethodsError,
    isLoading: paymentMethodsLoading,
  } = useAllPaymentMethodsQuery();

  const {
    data: account,
    error: accountError,
    isLoading: accountLoading,
  } = useAccount();

  const { data: profile } = useProfile();

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
      <Grid
        columnSpacing={2}
        container
        data-testid="billing-detail"
        rowSpacing={2}
        sx={{
          paddingTop: 1,
        }}
      >
        <BillingSummary
          balance={account?.balance ?? 0}
          balanceUninvoiced={account?.balance_uninvoiced ?? 0}
          paymentMethods={paymentMethods}
          promotions={account?.active_promotions}
        />
        <ContactInformation
          address1={account.address_1}
          address2={account.address_2}
          city={account.city}
          company={account.company}
          country={account.country}
          email={account.email}
          firstName={account.first_name}
          lastName={account.last_name}
          phone={account.phone}
          profile={profile}
          state={account.state}
          taxId={account.tax_id}
          zip={account.zip}
        />
        <PaymentInformation
          error={paymentMethodsError}
          isAkamaiCustomer={account?.billing_source === 'akamai'}
          loading={paymentMethodsLoading}
          paymentMethods={paymentMethods}
          profile={profile}
        />
        <BillingActivityPanel accountActiveSince={account?.active_since} />
      </Grid>
    </PayPalScriptProvider>
  );
};

export const BillingPaper = styled(Paper)(() => ({
  height: '100%',
  padding: `15px 20px`,
}));

export const BillingBox = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

export const BillingActionButton = styled(Button)(({ theme, ...props }) => ({
  ...(!props.disabled && {
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  }),
  font: theme.font.bold,
  fontSize: '.875rem',
  minHeight: 'unset',
  minWidth: 'auto',
  padding: 0,
}));

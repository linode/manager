import { Typography } from '@mui/material';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Button } from 'src/components/Button/Button';
import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { useAllPaymentMethodsQuery } from 'src/queries/account/payment';
import { isCreditCardExpired } from 'src/utilities/creditCard';

import type { PaymentMethod } from '@linode/api-v4/lib/account/types';

export const CreditCardExpiredBanner = () => {
  const history = useHistory();

  const { data: paymentMethods } = useAllPaymentMethodsQuery();

  if (!paymentMethods || paymentMethods?.length == 0) {
    return;
  }

  const isExpired = paymentMethods.some((paymentMethod: PaymentMethod) => {
    const ccExpiry =
      paymentMethod.type === 'credit_card' ? paymentMethod.data.expiry : null;
    return ccExpiry && isCreditCardExpired(ccExpiry);
  });

  if (!isExpired) {
    return;
  }

  return (
    <DismissibleBanner
      actionButton={
        <Button
          buttonType="primary"
          onClick={() => history.push('/account/billing')}
        >
          Update Card
        </Button>
      }
      important
      preferenceKey={'credit card expired'}
      variant="error"
    >
      <Typography variant="body1">
        Your credit card has expired! Please update your payment details.
      </Typography>
    </DismissibleBanner>
  );
};

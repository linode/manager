import { Button, Typography } from '@linode/ui';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { useAccount } from 'src/queries/account/account';
import { isCreditCardExpired } from 'src/utilities/creditCard';

export const CreditCardExpiredBanner = () => {
  const history = useHistory();

  const { data: account } = useAccount();

  if (!account) {
    return null;
  }

  const isExpired = Boolean(
    account?.credit_card?.expiry &&
      isCreditCardExpired(account?.credit_card.expiry)
  );

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
      preferenceKey={'credit-card-expired'}
      variant="error"
    >
      <Typography variant="body1">
        Your credit card has expired! Please update your payment details.
      </Typography>
    </DismissibleBanner>
  );
};

import { useAccount } from '@linode/queries';
import { Button, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { useFlags } from 'src/hooks/useFlags';
import { isCreditCardExpired } from 'src/utilities/creditCard';

export const CreditCardExpiredBanner = () => {
  const navigate = useNavigate();
  const flags = useFlags();

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
          onClick={() =>
            navigate({
              to: flags?.iamRbacPrimaryNavChanges
                ? '/billing'
                : '/account/billing',
            })
          }
        >
          Update Card
        </Button>
      }
      forceImportantIconVerticalCenter
      preferenceKey={'credit-card-expired'}
      variant="error"
    >
      <Typography variant="body1">
        Your credit card has expired! Please update your payment details.
      </Typography>
    </DismissibleBanner>
  );
};

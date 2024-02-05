import { PaymentMethod } from '@linode/api-v4/lib/account/types';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { PaymentMethodRow } from 'src/components/PaymentMethodRow/PaymentMethodRow';
import { Typography } from 'src/components/Typography';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  error: APIError[] | null | undefined;
  isChildUser?: boolean | undefined;
  isRestrictedUser?: boolean | undefined;
  loading: boolean;
  openDeleteDialog: (method: PaymentMethod) => void;
  paymentMethods: PaymentMethod[] | undefined;
}

const PaymentMethods = ({
  error,
  isChildUser,
  isRestrictedUser,
  loading,
  openDeleteDialog,
  paymentMethods,
}: Props) => {
  if (loading) {
    return (
      <Grid
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <CircleProgress mini />
      </Grid>
    );
  }

  if (error) {
    return (
      <Typography>
        {
          getAPIErrorOrDefault(
            error,
            'There was an error retrieving your payment methods.'
          )[0].reason
        }
      </Typography>
    );
  }

  if (!paymentMethods || paymentMethods?.length == 0) {
    return (
      <Typography>
        No payment methods have been specified for this account.
      </Typography>
    );
  }

  return (
    <>
      {paymentMethods.map((paymentMethod: PaymentMethod) => (
        <PaymentMethodRow
          isChildUser={isChildUser}
          isRestrictedUser={isRestrictedUser}
          key={paymentMethod.id}
          onDelete={() => openDeleteDialog(paymentMethod)}
          paymentMethod={paymentMethod}
        />
      ))}
    </>
  );
};

export { PaymentMethods };

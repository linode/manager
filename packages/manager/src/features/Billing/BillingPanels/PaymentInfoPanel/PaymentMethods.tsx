import { PaymentMethod } from '@linode/api-v4/lib/account/types';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { CircleProgress } from 'src/components/CircleProgress';
import Typography from 'src/components/core/Typography';
import PaymentMethodRow from 'src/components/PaymentMethodRow';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  error: APIError[] | null | undefined;
  loading: boolean;
  openDeleteDialog: (method: PaymentMethod) => void;
  paymentMethods: PaymentMethod[] | undefined;
}

const PaymentMethods = ({
  loading,
  error,
  paymentMethods,
  openDeleteDialog,
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
          key={paymentMethod.id}
          onDelete={() => openDeleteDialog(paymentMethod)}
          paymentMethod={paymentMethod}
        />
      ))}
    </>
  );
};

export { PaymentMethods };

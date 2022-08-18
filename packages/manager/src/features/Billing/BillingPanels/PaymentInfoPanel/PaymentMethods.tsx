import { PaymentMethod } from '@linode/api-v4/lib/account/types';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import PaymentMethodRow from 'src/components/PaymentMethodRow';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const useStyles = makeStyles(() => ({
  loading: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

interface Props {
  loading: boolean;
  error: APIError[] | null | undefined;
  paymentMethods: PaymentMethod[] | undefined;
  openDeleteDialog: (method: PaymentMethod) => void;
}

const PaymentMethods: React.FC<Props> = (props) => {
  const { loading, error, paymentMethods, openDeleteDialog } = props;
  const classes = useStyles();

  if (loading) {
    return (
      <Grid className={classes.loading}>
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
          paymentMethod={paymentMethod}
          onDelete={() => openDeleteDialog(paymentMethod)}
        />
      ))}
    </>
  );
};

export default PaymentMethods;

import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { PaymentMethod } from '@linode/api-v4/lib/account/types';
import { useTheme } from '@mui/material/styles';
import Paper from 'src/components/core/Paper';
import Box from '@mui/material/Box';
import Chip from 'src/components/core/Chip';
import CreditCard from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';
import ThirdPartyPayment from './ThirdPartyPayment';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { makeDefaultPaymentMethod } from '@linode/api-v4/lib';
import { useSnackbar } from 'notistack';
import { queryClient } from 'src/queries/base';
import { queryKey } from 'src/queries/accountPayment';

interface Props {
  paymentMethod: PaymentMethod;
  onDelete: () => void;
}

const PaymentMethodRow = (props: Props) => {
  const theme = useTheme();
  const { paymentMethod, onDelete } = props;
  const { type, is_default } = paymentMethod;
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const makeDefault = (id: number) => {
    makeDefaultPaymentMethod(id)
      .then(() => queryClient.invalidateQueries(`${queryKey}-all`))
      .catch((errors) =>
        enqueueSnackbar(
          errors[0]?.reason || 'Unable to change your default payment method.',
          { variant: 'error' }
        )
      );
  };

  const actions: Action[] = [
    {
      title: 'Make a Payment',
      onClick: () => {
        history.push({
          pathname: '/account/billing/make-payment/',
          state: { paymentMethod },
        });
      },
    },
    {
      title: 'Make Default',
      disabled: paymentMethod.is_default,
      tooltip: paymentMethod.is_default
        ? 'This is already your default payment method.'
        : undefined,
      onClick: () => makeDefault(paymentMethod.id),
    },
    {
      title: 'Delete',
      disabled: paymentMethod.is_default,
      tooltip: paymentMethod.is_default
        ? 'You cannot remove this payment method without setting a new default first.'
        : undefined,
      onClick: onDelete,
    },
  ];

  const getActionMenuAriaLabel = (paymentMethod: PaymentMethod) => {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (paymentMethod.type) {
      case 'paypal':
        return `Action menu for Paypal ${paymentMethod.data.email}`;
      default:
        return `Action menu for card ending in ${paymentMethod.data.last_four}`;
    }
  };

  const sxBoxFlex = {
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <Paper
      variant="outlined"
      data-testid={`payment-method-row-${paymentMethod.id}`}
      data-qa-payment-row={type}
      sx={{
        '&:not(:last-of-type)': {
          marginBottom: theme.spacing(),
        },
        '&&': {
          // TODO: Remove "&&" when Paper has been refactored
          padding: 0,
        },
      }}
    >
      <Box sx={sxBoxFlex}>
        <Box sx={{ ...sxBoxFlex, paddingRight: theme.spacing(2) }}>
          {paymentMethod.type === 'credit_card' ? (
            <CreditCard creditCard={paymentMethod.data} />
          ) : (
            <ThirdPartyPayment paymentMethod={paymentMethod} />
          )}
        </Box>
        <Box sx={sxBoxFlex}>
          {is_default && <Chip label="DEFAULT" component="span" size="small" />}
        </Box>
        <Box
          sx={{
            marginLeft: 'auto',
            '& button': {
              margin: 0,
            },
          }}
        >
          <ActionMenu
            actionsList={actions}
            ariaLabel={getActionMenuAriaLabel(paymentMethod)}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default PaymentMethodRow;

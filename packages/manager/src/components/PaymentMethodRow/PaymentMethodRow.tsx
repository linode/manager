import { useMakeDefaultPaymentMethodMutation } from '@linode/queries';
import { Box, Chip, Paper } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import CreditCard from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';

import { ThirdPartyPayment } from './ThirdPartyPayment';

import type { PaymentMethod } from '@linode/api-v4/lib/account/types';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  /**
   * Whether the user is a child user.
   */
  isChildUser?: boolean | undefined;
  /**
   * Whether the user is a restricted user.
   */
  isRestrictedUser?: boolean | undefined;
  /**
   * Function called when the delete button in the Action Menu is pressed.
   */
  onDelete: () => void;
  /**
   * Payment method type and data.
   */
  paymentMethod: PaymentMethod;
}

/**
 * The `PaymentMethodRow` displays the given payment method and supports various actions for each payment method. It can be used
 * for credit cards, Google Pay, and PayPal.
 */
export const PaymentMethodRow = (props: Props) => {
  const theme = useTheme();
  const { isRestrictedUser, onDelete, paymentMethod } = props;
  const { is_default, type } = paymentMethod;
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const { mutateAsync: makePaymentMethodDefault } =
    useMakeDefaultPaymentMethodMutation(props.paymentMethod.id);

  const makeDefault = () => {
    makePaymentMethodDefault().catch((errors) =>
      enqueueSnackbar(
        errors[0]?.reason || 'Unable to change your default payment method.',
        { variant: 'error' }
      )
    );
  };

  const actions: Action[] = [
    {
      disabled: isRestrictedUser,
      onClick: () => {
        navigate({
          to: '/account/billing',
          search: (prev) => ({
            ...prev,
            action: 'make-payment',
            paymentMethodId: paymentMethod.id,
          }),
        });
      },
      title: 'Make a Payment',
    },
    {
      disabled: isRestrictedUser || paymentMethod.is_default,
      onClick: makeDefault,
      title: 'Make Default',
      tooltip: paymentMethod.is_default
        ? 'This is already your default payment method.'
        : undefined,
    },
    {
      disabled: isRestrictedUser || paymentMethod.is_default,
      onClick: onDelete,
      title: 'Delete',
      tooltip: paymentMethod.is_default
        ? 'You cannot remove this payment method without setting a new default first.'
        : undefined,
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
    alignItems: 'center',
    display: 'flex',
  };

  return (
    <Paper
      data-qa-payment-row={type}
      data-testid={`payment-method-row-${paymentMethod.id}`}
      sx={{
        '&&': {
          // TODO: Remove "&&" when Paper has been refactored
          padding: 0,
        },
        '&:not(:last-of-type)': {
          marginBottom: theme.spacing(),
        },
      }}
      variant="outlined"
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
          {is_default && <Chip component="span" label="DEFAULT" size="small" />}
        </Box>
        <Box
          sx={{
            '& button': {
              margin: 0,
            },
            marginLeft: 'auto',
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

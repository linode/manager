import { makeDefaultPaymentMethod } from '@linode/api-v4/lib';
import { PaymentMethod } from '@linode/api-v4/lib/account/types';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';

import { Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Box } from 'src/components/Box';
import { Chip } from 'src/components/Chip';
import { Paper } from 'src/components/Paper';
import CreditCard from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';
import { queryKey } from 'src/queries/accountPayment';

import { ThirdPartyPayment } from './ThirdPartyPayment';

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
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

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
      disabled: isRestrictedUser,
      onClick: () => {
        history.push({
          pathname: '/account/billing/make-payment/',
          state: { paymentMethod },
        });
      },
      title: 'Make a Payment',
    },
    {
      disabled: isRestrictedUser || paymentMethod.is_default,
      onClick: () => makeDefault(paymentMethod.id),
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
      sx={{
        '&&': {
          // TODO: Remove "&&" when Paper has been refactored
          padding: 0,
        },
        '&:not(:last-of-type)': {
          marginBottom: theme.spacing(),
        },
      }}
      data-qa-payment-row={type}
      data-testid={`payment-method-row-${paymentMethod.id}`}
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

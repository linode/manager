import { PaymentMethod } from '@linode/api-v4';
import { ActivePromotion } from '@linode/api-v4/lib/account/types';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import { Breakpoint } from '@mui/material/styles';
import * as React from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Currency } from 'src/components/Currency';
import { Divider } from 'src/components/Divider';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useNotificationsQuery } from 'src/queries/accountNotifications';
import { useGrants } from 'src/queries/profile';
import { isWithinDays } from 'src/utilities/date';

import { BillingPaper } from '../../BillingDetail';
import PaymentDrawer from './PaymentDrawer';
import PromoDialog from './PromoDialog';
import { PromoDisplay } from './PromoDisplay';

import type { GridSize } from '@mui/material';

interface BillingSummaryProps {
  balance: number;
  balanceUninvoiced: number;
  paymentMethods: PaymentMethod[] | undefined;
  promotions?: ActivePromotion[];
}

export const BillingSummary = (props: BillingSummaryProps) => {
  const theme = useTheme();
  const { data: notifications } = useNotificationsQuery();
  const { _isRestrictedUser, account } = useAccountManagement();

  const [isPromoDialogOpen, setIsPromoDialogOpen] = React.useState<boolean>(
    false
  );

  const { data: grants } = useGrants();
  const accountAccessGrant = grants?.global?.account_access;
  const readOnlyAccountAccess = accountAccessGrant === 'read_only';

  // If a user has a payment_due notification with a severity of critical, it indicates that they are outside of any grace period they may have and payment is due immediately.
  const isBalanceOutsideGracePeriod = notifications?.some(
    (notification) =>
      notification.type === 'payment_due' &&
      notification.severity === 'critical'
  );

  const { balance, balanceUninvoiced, paymentMethods, promotions } = props;

  // On-the-fly route matching so this component can open the drawer itself.
  const routeForMakePayment = '/account/billing/make-payment';
  const makePaymentRouteMatch = Boolean(useRouteMatch(routeForMakePayment));

  const { replace } = useHistory();
  const location = useLocation<{ paymentMethod: PaymentMethod }>();

  const [paymentDrawerOpen, setPaymentDrawerOpen] = React.useState<boolean>(
    false
  );

  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<
    PaymentMethod | undefined
  >(undefined);

  const openPaymentDrawer = React.useCallback(
    (selectedPaymentMethod: PaymentMethod) => {
      setPaymentDrawerOpen(true);
      setSelectedPaymentMethod(selectedPaymentMethod);
    },
    []
  );

  const closePaymentDrawer = React.useCallback(() => {
    setPaymentDrawerOpen(false);
    setSelectedPaymentMethod(undefined);
    replace('/account/billing');
  }, [replace]);

  const openPromoDialog = () => setIsPromoDialogOpen(true);
  const closePromoDialog = () => setIsPromoDialogOpen(false);

  React.useEffect(() => {
    if (!makePaymentRouteMatch) {
      return;
    }

    const selectedPaymentMethod =
      location?.state?.paymentMethod ??
      paymentMethods?.find((payment) => payment.is_default) ??
      undefined;

    openPaymentDrawer(selectedPaymentMethod);
  }, [
    paymentMethods,
    openPaymentDrawer,
    makePaymentRouteMatch,
    location.state,
  ]);

  //
  // Account Balance logic
  //
  const pastDueBalance = balance > 0 && isBalanceOutsideGracePeriod;

  const accountBalanceText = pastDueBalance
    ? 'Payment Due'
    : balance > 0
    ? 'Balance'
    : balance < 0
    ? 'Credit'
    : 'You have no balance at this time.';

  const sxBalance = {
    color:
      balance === 0 || (balance > 0 && !isBalanceOutsideGracePeriod)
        ? theme.palette.text.primary
        : balance < 0
        ? theme.color.green
        : pastDueBalance
        ? theme.color.red
        : '',
  };

  // The layout changes if there are promotions.
  const gridDimensions: Partial<Record<Breakpoint, GridSize>> =
    promotions && promotions.length > 0 ? { md: 4, xs: 12 } : { sm: 6, xs: 12 };

  const balanceJSX =
    balance > 0 ? (
      <Typography style={{ marginTop: 16 }}>
        <Button
          sx={{
            ...theme.applyLinkStyles,
            verticalAlign: 'initial',
          }}
          onClick={() => replace(routeForMakePayment)}
        >
          {pastDueBalance ? 'Make a payment immediately' : 'Make a payment'}
        </Button>
        {pastDueBalance ? ` to avoid service disruption.` : '.'}
      </Typography>
    ) : null;

  const showAddPromoLink =
    balance <= 0 &&
    !_isRestrictedUser &&
    isWithinDays(90, account?.active_since) &&
    promotions?.length === 0;

  const accruedChargesHelperText =
    account?.billing_source === 'akamai'
      ? 'Accrued charges shown are an approximation and may not exactly reflect your post-tax invoice.'
      : 'Our billing cycle ends on the last day of the month. You may be invoiced before the end of the cycle if your balance exceeds your credit limit.';

  return (
    <>
      <Grid container margin={0} spacing={2} xs={12}>
        <Grid {...gridDimensions} sm={6}>
          <BillingPaper variant="outlined">
            <Typography variant="h3">Account Balance</Typography>
            <Divider />
            <Box
              alignItems="center"
              display="flex"
              justifyContent="space-between"
              marginTop="12px"
            >
              <Typography
                data-testid="account-balance-text"
                style={{ marginRight: 8 }}
                sx={sxBalance}
                variant={balance === 0 ? 'body1' : 'h3'}
              >
                {accountBalanceText}
              </Typography>
              <Typography sx={sxBalance} variant="h3">
                <Currency
                  dataAttrs={{ 'data-testid': 'account-balance-value' }}
                  quantity={Math.abs(balance)}
                />
              </Typography>
            </Box>
            {!readOnlyAccountAccess ? balanceJSX : null}
            {showAddPromoLink ? (
              <Typography
                sx={{
                  marginTop: theme.spacing(),
                }}
              >
                <Button
                  sx={{
                    ...theme.applyLinkStyles,
                  }}
                  onClick={openPromoDialog}
                >
                  Add a promo code
                </Button>
              </Typography>
            ) : null}
          </BillingPaper>
        </Grid>
        {promotions && promotions?.length > 0 ? (
          <Grid md={4} sm={6} xs={12}>
            <BillingPaper variant="outlined">
              <Typography variant="h3">Promotions</Typography>

              <Divider />
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {promotions?.map((promo) => (
                  <PromoDisplay
                    key={`${promo.summary}-${promo.expire_dt}`}
                    {...promo}
                  />
                ))}
              </div>
            </BillingPaper>
          </Grid>
        ) : null}
        <Grid {...gridDimensions}>
          <BillingPaper variant="outlined">
            <Box alignItems="center" display="flex">
              <Typography variant="h3">Accrued Charges</Typography>
              <TooltipIcon
                status="help"
                sxTooltipIcon={{ padding: '0 8px' }}
                text={accruedChargesHelperText}
              />
            </Box>
            <Divider />
            <Box
              alignItems="center"
              display="flex"
              justifyContent="space-between"
              marginTop="12px"
            >
              <Typography>Since last invoice</Typography>
              <Typography
                sx={{
                  color: theme.palette.text.primary,
                }}
                variant="h3"
              >
                <Currency
                  dataAttrs={{ 'data-testid': 'accrued-charges-value' }}
                  quantity={balanceUninvoiced}
                />
              </Typography>
            </Box>
          </BillingPaper>
        </Grid>
      </Grid>
      <PaymentDrawer
        onClose={closePaymentDrawer}
        open={paymentDrawerOpen}
        paymentMethods={paymentMethods}
        selectedPaymentMethod={selectedPaymentMethod}
      />
      <PromoDialog onClose={closePromoDialog} open={isPromoDialogOpen} />
    </>
  );
};

export default React.memo(BillingSummary);

import * as React from 'react';
import Box from 'src/components/core/Box';
import Currency from 'src/components/Currency';
import Divider from 'src/components/core/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import HelpIcon from 'src/components/HelpIcon';
import PaymentDrawer from './PaymentDrawer';
import PromoDialog from './PromoDialog';
import Typography from 'src/components/core/Typography';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useNotifications from 'src/hooks/useNotifications';
import Button from 'src/components/Button';
import { BillingPaper } from '../../BillingDetail';
import { Breakpoint } from '@mui/material/styles';
import { getGrantData } from 'src/queries/profile';
import { GridSize } from '@mui/material/Grid';
import { isWithinDays } from 'src/utilities/date';
import { PaymentMethod } from '@linode/api-v4';
import { PromoDisplay } from './PromoDisplay';
import { styled, useTheme } from '@mui/material/styles';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { ActivePromotion } from '@linode/api-v4/lib/account/types';

const GridContainer = styled(Grid)({
  marginBottom: 0,
});

interface BillingSummaryProps {
  promotions?: ActivePromotion[];
  paymentMethods: PaymentMethod[] | undefined;
  balanceUninvoiced: number;
  balance: number;
}

export const BillingSummary = (props: BillingSummaryProps) => {
  const theme = useTheme();
  const notifications = useNotifications();
  const { account, _isRestrictedUser } = useAccountManagement();

  const [isPromoDialogOpen, setIsPromoDialogOpen] = React.useState<boolean>(
    false
  );

  const grantData = getGrantData();
  const accountAccessGrant = grantData?.global?.account_access;
  const readOnlyAccountAccess = accountAccessGrant === 'read_only';

  // If a user has a payment_due notification with a severity of critical, it indicates that they are outside of any grace period they may have and payment is due immediately.
  const isBalanceOutsideGracePeriod = notifications.some(
    (notification) =>
      notification.type === 'payment_due' &&
      notification.severity === 'critical'
  );

  const { promotions, paymentMethods, balanceUninvoiced, balance } = props;

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
    promotions && promotions.length > 0 ? { xs: 12, md: 4 } : { xs: 12, sm: 6 };

  const balanceJSX =
    balance > 0 ? (
      <Typography style={{ marginTop: 16 }}>
        <Button
          sx={{
            ...theme.applyLinkStyles,
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
      <GridContainer container xs={12} spacing={2}>
        <Grid {...gridDimensions} sm={6}>
          <BillingPaper variant="outlined">
            <Typography variant="h3">Account Balance</Typography>
            <Divider />
            <Box
              marginTop="12px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant={balance === 0 ? 'body1' : 'h3'}
                style={{ marginRight: 8 }}
                sx={sxBalance}
                data-testid="account-balance-text"
              >
                {accountBalanceText}
              </Typography>
              <Typography variant="h3" sx={sxBalance}>
                <Currency
                  quantity={Math.abs(balance)}
                  dataAttrs={{ 'data-testid': 'account-balance-value' }}
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
                  onClick={openPromoDialog}
                  sx={{
                    ...theme.applyLinkStyles,
                  }}
                >
                  Add a promo code
                </Button>
              </Typography>
            ) : null}
          </BillingPaper>
        </Grid>
        {promotions && promotions?.length > 0 ? (
          <Grid xs={12} sm={6} md={4}>
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
            <Box display="flex" alignItems="center">
              <Typography variant="h3">Accrued Charges</Typography>
              <HelpIcon
                sx={{ padding: `0px 8px` }}
                text={accruedChargesHelperText}
              />
            </Box>
            <Divider />
            <Box
              marginTop="12px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography>Since last invoice</Typography>
              <Typography
                variant="h3"
                sx={{
                  color: theme.palette.text.primary,
                }}
              >
                <Currency
                  quantity={balanceUninvoiced}
                  dataAttrs={{ 'data-testid': 'accrued-charges-value' }}
                />
              </Typography>
            </Box>
          </BillingPaper>
        </Grid>
      </GridContainer>
      <PaymentDrawer
        paymentMethods={paymentMethods}
        selectedPaymentMethod={selectedPaymentMethod}
        open={paymentDrawerOpen}
        onClose={closePaymentDrawer}
      />
      <PromoDialog open={isPromoDialogOpen} onClose={closePromoDialog} />
    </>
  );
};

export default React.memo(BillingSummary);

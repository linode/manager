import * as React from 'react';
import AddPaymentMethodDrawer from './AddPaymentMethodDrawer';
import Box from 'src/components/core/Box';
import DeletePaymentMethodDialog from 'src/components/PaymentMethodRow/DeletePaymentMethodDialog';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Grid from '@mui/material/Unstable_Grid2';
import Link from 'src/components/Link';
import PayPalIcon from 'src/assets/icons/payment/payPal.svg';
import Typography from 'src/components/core/Typography';
import { APIError } from '@linode/api-v4/lib/types';
import { deletePaymentMethod, PaymentMethod } from '@linode/api-v4/lib/account';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { PaymentMethods } from 'src/features/Billing/BillingPanels/PaymentInfoPanel/PaymentMethods';
import { queryClient } from 'src/queries/base';
import { queryKey } from 'src/queries/accountPayment';
import { styled } from '@mui/material/styles';
import { useHistory, useRouteMatch } from 'react-router-dom';
import {
  BillingActionButton,
  BillingBox,
  BillingPaper,
} from '../../BillingDetail';

interface Props {
  error?: APIError[] | null;
  isAkamaiCustomer: boolean;
  loading: boolean;
  paymentMethods: PaymentMethod[] | undefined;
}

const StyledDismissibleBanner = styled(DismissibleBanner)(({ theme }) => ({
  fontSize: '0.875rem',
  marginTop: theme.spacing(2),
  padding: '8px 0px',
  '& button': {
    marginLeft: theme.spacing(),
  },
}));

const PaymentInformation = (props: Props) => {
  const { loading, error, paymentMethods, isAkamaiCustomer } = props;
  const [addDrawerOpen, setAddDrawerOpen] = React.useState<boolean>(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(
    false
  );
  const [deleteError, setDeleteError] = React.useState<string | undefined>();
  const [deleteLoading, setDeleteLoading] = React.useState<boolean>(false);
  const [
    deletePaymentMethodSelection,
    setDeletePaymentMethodSelection,
  ] = React.useState<PaymentMethod | undefined>();
  const { replace } = useHistory();

  const drawerLink = '/account/billing/add-payment-method';
  const addPaymentMethodRouteMatch = Boolean(useRouteMatch(drawerLink));

  const showPayPalAvailableNotice =
    !isAkamaiCustomer &&
    !loading &&
    !paymentMethods?.some(
      (paymetMethod: PaymentMethod) => paymetMethod.type === 'paypal'
    );

  const doDelete = () => {
    setDeleteLoading(true);
    deletePaymentMethod(deletePaymentMethodSelection!.id)
      .then(() => {
        setDeleteLoading(false);
        closeDeleteDialog();
        queryClient.invalidateQueries(`${queryKey}-all`);
      })
      .catch((e: APIError[]) => {
        setDeleteLoading(false);
        setDeleteError(
          getAPIErrorOrDefault(e, 'Unable to delete payment method.')[0].reason
        );
      });
  };

  const openAddDrawer = React.useCallback(() => setAddDrawerOpen(true), []);

  const closeAddDrawer = React.useCallback(() => {
    setAddDrawerOpen(false);
    replace('/account/billing');
  }, [replace]);

  const openDeleteDialog = (method: PaymentMethod) => {
    setDeleteError(undefined);
    setDeletePaymentMethodSelection(method);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  React.useEffect(() => {
    if (addPaymentMethodRouteMatch) {
      openAddDrawer();
    }
  }, [addPaymentMethodRouteMatch, openAddDrawer]);

  return (
    <Grid xs={12} md={6}>
      <BillingPaper variant="outlined" data-qa-billing-summary>
        <BillingBox>
          <Typography variant="h3">Payment Methods</Typography>
          {!isAkamaiCustomer ? (
            <BillingActionButton
              data-testid="payment-info-add-payment-method"
              onClick={() => replace(drawerLink)}
            >
              Add Payment Method
            </BillingActionButton>
          ) : null}
        </BillingBox>
        {!isAkamaiCustomer ? (
          <PaymentMethods
            loading={loading}
            error={error}
            paymentMethods={paymentMethods}
            openDeleteDialog={openDeleteDialog}
          />
        ) : (
          <Typography data-testid="akamai-customer-text">
            Payment method is determined by your contract with Akamai
            Technologies.
            <br />
            Contact your representative with questions.
          </Typography>
        )}
        {showPayPalAvailableNotice ? (
          <StyledDismissibleBanner preferenceKey="paypal-available-notification">
            <Box display="flex" alignItems="center">
              <PayPalIcon
                styles={{
                  flexShrink: 0,
                  height: 20,
                  marginRight: '6px',
                }}
              />
              <Typography
                sx={{
                  marginLeft: 0,
                  fontSize: '0.875rem',
                }}
              >
                PayPal is now available for recurring payments.{' '}
                <Link to="#" onClick={() => replace(drawerLink)}>
                  Add PayPal.
                </Link>
              </Typography>
            </Box>
          </StyledDismissibleBanner>
        ) : null}
        <AddPaymentMethodDrawer
          open={addDrawerOpen}
          onClose={closeAddDrawer}
          paymentMethods={paymentMethods}
        />
        <DeletePaymentMethodDialog
          open={deleteDialogOpen}
          onClose={closeDeleteDialog}
          onDelete={doDelete}
          paymentMethod={deletePaymentMethodSelection}
          loading={deleteLoading}
          error={deleteError}
        />
      </BillingPaper>
    </Grid>
  );
};

export default React.memo(PaymentInformation);

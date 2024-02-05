import { PaymentMethod, deletePaymentMethod } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { DeletePaymentMethodDialog } from 'src/components/PaymentMethodRow/DeletePaymentMethodDialog';
import { Typography } from 'src/components/Typography';
import { PaymentMethods } from 'src/features/Billing/BillingPanels/PaymentInfoPanel/PaymentMethods';
import { getDisabledTooltipText } from 'src/features/Billing/billingUtils';
import { ADD_PAYMENT_METHOD } from 'src/features/Billing/constants';
import { useFlags } from 'src/hooks/useFlags';
import { queryKey } from 'src/queries/accountPayment';
import { useGrants } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import {
  BillingActionButton,
  BillingBox,
  BillingPaper,
} from '../../BillingDetail';
import AddPaymentMethodDrawer from './AddPaymentMethodDrawer';

import type { Profile } from '@linode/api-v4';

interface Props {
  error?: APIError[] | null;
  isAkamaiCustomer: boolean;
  loading: boolean;
  paymentMethods: PaymentMethod[] | undefined;
  profile: Profile | undefined;
}

const PaymentInformation = (props: Props) => {
  const { error, isAkamaiCustomer, loading, paymentMethods, profile } = props;
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
  const queryClient = useQueryClient();
  const flags = useFlags();
  const { data: grants } = useGrants();
  const drawerLink = '/account/billing/add-payment-method';
  const addPaymentMethodRouteMatch = Boolean(useRouteMatch(drawerLink));

  const isChildUser =
    flags.parentChildAccountAccess && profile?.user_type === 'child';

  const isRestrictedUser =
    isChildUser || grants?.global.account_access === 'read_only';

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

  const conditionalTooltipText = getDisabledTooltipText({
    isChildUser,
    isRestrictedUser,
  });

  return (
    <Grid md={6} xs={12}>
      <BillingPaper data-qa-billing-summary variant="outlined">
        <BillingBox>
          <Typography variant="h3">Payment Methods</Typography>
          {!isAkamaiCustomer ? (
            <BillingActionButton
              data-testid="payment-info-add-payment-method"
              disableFocusRipple
              disableRipple
              disableTouchRipple
              disabled={isRestrictedUser}
              onClick={() => replace(drawerLink)}
              tooltipText={conditionalTooltipText}
            >
              {ADD_PAYMENT_METHOD}
            </BillingActionButton>
          ) : null}
        </BillingBox>
        {!isAkamaiCustomer ? (
          <PaymentMethods
            error={error}
            isChildUser={isChildUser}
            isRestrictedUser={isRestrictedUser}
            loading={loading}
            openDeleteDialog={openDeleteDialog}
            paymentMethods={paymentMethods}
          />
        ) : (
          <Typography data-testid="akamai-customer-text">
            Payment method is determined by your contract with Akamai
            Technologies.
            <br />
            Contact your representative with questions.
          </Typography>
        )}
        <AddPaymentMethodDrawer
          onClose={closeAddDrawer}
          open={addDrawerOpen}
          paymentMethods={paymentMethods}
        />
        <DeletePaymentMethodDialog
          error={deleteError}
          loading={deleteLoading}
          onClose={closeDeleteDialog}
          onDelete={doDelete}
          open={deleteDialogOpen}
          paymentMethod={deletePaymentMethodSelection}
        />
      </BillingPaper>
    </Grid>
  );
};

export default React.memo(PaymentInformation);

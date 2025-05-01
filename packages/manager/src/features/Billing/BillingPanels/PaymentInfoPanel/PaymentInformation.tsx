import { deletePaymentMethod } from '@linode/api-v4/lib/account';
import { accountQueries } from '@linode/queries';
import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { DeletePaymentMethodDialog } from 'src/components/PaymentMethodRow/DeletePaymentMethodDialog';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { PaymentMethods } from 'src/features/Billing/BillingPanels/PaymentInfoPanel/PaymentMethods';
import { ADD_PAYMENT_METHOD } from 'src/features/Billing/constants';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import {
  BillingActionButton,
  BillingBox,
  BillingPaper,
} from '../../BillingDetail';
import { AddPaymentMethodDrawer } from './AddPaymentMethodDrawer/AddPaymentMethodDrawer';

import type { Profile } from '@linode/api-v4';
import type { PaymentMethod } from '@linode/api-v4/lib/account';
import type { APIError } from '@linode/api-v4/lib/types';

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

  const [deleteDialogOpen, setDeleteDialogOpen] =
    React.useState<boolean>(false);
  const [deleteError, setDeleteError] = React.useState<string | undefined>();
  const [deleteLoading, setDeleteLoading] = React.useState<boolean>(false);
  const [deletePaymentMethodSelection, setDeletePaymentMethodSelection] =
    React.useState<PaymentMethod | undefined>();
  const { replace } = useHistory();
  const queryClient = useQueryClient();
  const drawerLink = '/account/billing/add-payment-method';
  const addPaymentMethodRouteMatch = Boolean(useRouteMatch(drawerLink));

  const isChildUser = profile?.user_type === 'child';

  const isReadOnly =
    useRestrictedGlobalGrantCheck({
      globalGrantType: 'account_access',
      permittedGrantLevel: 'read_write',
    }) || isChildUser;

  const doDelete = () => {
    setDeleteLoading(true);
    deletePaymentMethod(deletePaymentMethodSelection!.id)
      .then(() => {
        setDeleteLoading(false);
        closeDeleteDialog();
        queryClient.invalidateQueries({
          queryKey: accountQueries.paymentMethods.queryKey,
        });
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
    <Grid
      size={{
        md: 6,
        xs: 12,
      }}
    >
      <BillingPaper data-qa-billing-summary variant="outlined">
        <BillingBox>
          <Typography variant="h3">Payment Methods</Typography>
          {!isAkamaiCustomer ? (
            <BillingActionButton
              data-testid="payment-info-add-payment-method"
              disabled={isReadOnly}
              disableFocusRipple
              disableRipple
              disableTouchRipple
              onClick={() => replace(drawerLink)}
              tooltipText={getRestrictedResourceText({
                includeContactInfo: false,
                isChildUser,
                resourceType: 'Account',
              })}
            >
              {ADD_PAYMENT_METHOD}
            </BillingActionButton>
          ) : null}
        </BillingBox>
        {!isAkamaiCustomer ? (
          <PaymentMethods
            error={error}
            isChildUser={isChildUser}
            isRestrictedUser={isReadOnly}
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

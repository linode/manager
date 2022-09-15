import { deletePaymentMethod, PaymentMethod } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import PayPalIcon from 'src/assets/icons/payment/payPal.svg';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import DeletePaymentMethodDialog from 'src/components/PaymentMethodRow/DeletePaymentMethodDialog';
import styled from 'src/containers/SummaryPanels.styles';
import PaymentMethods from 'src/features/Billing/BillingPanels/PaymentInfoPanel/PaymentMethods';
import { queryKey } from 'src/queries/accountPayment';
import { queryClient } from 'src/queries/base';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import AddPaymentMethodDrawer from './AddPaymentMethodDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  summarySectionHeight: {
    flex: '0 1 auto',
    width: '100%',
  },
  container: {
    flex: 1,
    maxWidth: '100%',
    position: 'relative',
    '&.mlMain': {
      [theme.breakpoints.up('lg')]: {
        maxWidth: '78.8%',
      },
    },
  },
  billingGroup: {
    marginBottom: theme.spacing(3),
  },
  paymentMethodNoticeContainer: {
    fontSize: '0.875rem',
    marginTop: theme.spacing(2),
    padding: `8px 0px`,
    '& button': {
      marginLeft: theme.spacing(),
    },
    '& p': {
      // Overwrites the default styling from the banner
      fontSize: '0.875rem',
      marginLeft: 0,
    },
  },
  payPalIcon: {
    flexShrink: 0,
    height: 20,
    marginRight: '6px',
  },
  edit: {
    color: theme.textColors.linkActiveLight,
    fontFamily: theme.font.normal,
    fontSize: '.875rem',
    fontWeight: 700,
    minHeight: 'unset',
    minWidth: 'auto',
    padding: 0,
    '&:hover, &:focus': {
      backgroundColor: 'transparent',
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
  },
}));

interface Props {
  loading: boolean;
  error?: APIError[] | null;
  paymentMethods: PaymentMethod[] | undefined;
  isAkamaiCustomer: boolean;
}

const PaymentInformation: React.FC<Props> = (props) => {
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

  const classes = useStyles();
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
    <Grid item xs={12} md={6}>
      <Paper className={classes.summarySection} data-qa-billing-summary>
        <Grid container spacing={2}>
          <Grid item className={classes.container}>
            <Typography variant="h3" className={classes.title}>
              Payment Methods
            </Typography>
          </Grid>
          <Grid item>
            {!isAkamaiCustomer ? (
              <Button
                data-testid="payment-info-add-payment-method"
                className={classes.edit}
                onClick={() => replace(drawerLink)}
              >
                Add Payment Method
              </Button>
            ) : null}
          </Grid>
        </Grid>
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
          <DismissibleBanner
            className={classes.paymentMethodNoticeContainer}
            preferenceKey="paypal-available-notification"
          >
            <Box display="flex" alignItems="center">
              <PayPalIcon className={classes.payPalIcon} />
              <Typography>
                PayPal is now available for recurring payments.{' '}
                <Link to="#" onClick={() => replace(drawerLink)}>
                  Add PayPal.
                </Link>
              </Typography>
            </Box>
          </DismissibleBanner>
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
      </Paper>
    </Grid>
  );
};

export default React.memo(PaymentInformation);

import { deletePaymentMethod, PaymentMethod } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import GooglePayIcon from 'src/assets/icons/payment/googlePay.svg';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import PaymentMethodRow from 'src/components/PaymentMethodRow';
import styled from 'src/containers/SummaryPanels.styles';
import useFlags from 'src/hooks/useFlags';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import AddPaymentMethodDrawer from './AddPaymentMethodDrawer';
import DeletePaymentMethodDialog from 'src/components/PaymentMethodRow/DeletePaymentMethodDialog';
import { queryClient } from 'src/queries/base';
import { queryKey } from 'src/queries/accountPayment';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  summarySectionHeight: {
    flex: '0 1 auto',
    width: '100%',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
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
  googlePayNoticeContainer: {
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
  googlePayIcon: {
    flexShrink: 0,
    height: 20,
    marginRight: theme.spacing(),
  },
  edit: {
    color: theme.cmrTextColors.linkActiveLight,
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
}

const PaymentInformation: React.FC<Props> = (props) => {
  const { loading, error, paymentMethods } = props;
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
  const flags = useFlags();
  const { replace } = useHistory();

  const drawerLink = '/account/billing/add-payment-method';
  const addPaymentMethodRouteMatch = Boolean(useRouteMatch(drawerLink));

  const isGooglePayEnabled = flags.additionalPaymentMethods?.includes(
    'google_pay'
  );

  const showAddPaymentMethodButton =
    paymentMethods?.length === 0 ||
    isGooglePayEnabled ||
    (!isGooglePayEnabled &&
      !paymentMethods?.some(
        (method: PaymentMethod) => method.type === 'credit_card'
      ));

  const showGooglePayAvailableNotice =
    !loading &&
    isGooglePayEnabled &&
    !paymentMethods?.some(
      (paymetMethod: PaymentMethod) => paymetMethod.type === 'google_pay'
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
          {showAddPaymentMethodButton ? (
            <Grid item>
              <Button
                className={classes.edit}
                onClick={() => replace(drawerLink)}
              >
                Add Payment Method
              </Button>
            </Grid>
          ) : null}
        </Grid>
        {loading ? (
          <Grid className={classes.loading}>
            <CircleProgress mini />
          </Grid>
        ) : error ? (
          <Typography>
            {
              getAPIErrorOrDefault(
                error,
                'There was an error retrieving your payment methods.'
              )[0].reason
            }
          </Typography>
        ) : !paymentMethods || paymentMethods?.length == 0 ? (
          <Typography>
            No payment methods have been specified for this account.
          </Typography>
        ) : (
          paymentMethods.map((paymentMethod: PaymentMethod) => (
            <PaymentMethodRow
              key={paymentMethod.id}
              paymentMethod={paymentMethod}
              onDelete={() => openDeleteDialog(paymentMethod)}
            />
          ))
        )}
        {showGooglePayAvailableNotice ? (
          <DismissibleBanner
            className={classes.googlePayNoticeContainer}
            preferenceKey="google-pay-available-notification"
          >
            <Box display="flex" alignItems="center">
              <GooglePayIcon className={classes.googlePayIcon} />
              <Typography>
                Google Pay is now available for recurring payments.{' '}
                <Link to="#" onClick={() => replace(drawerLink)}>
                  Add Google Pay
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

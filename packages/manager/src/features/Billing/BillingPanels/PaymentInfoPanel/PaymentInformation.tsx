import { deletePaymentMethod, PaymentMethod } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import GooglePay from 'src/assets/icons/providers/google-logo.svg';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import PaymentMethodRow from 'src/components/PaymentMethodRow';
import DismissibleBanner from 'src/components/DismissibleBanner';
import CircleProgress from 'src/components/CircleProgress';
import styled from 'src/containers/SummaryPanels.styles';
import useFlags from 'src/hooks/useFlags';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import AddPaymentMethodDrawer from './AddPaymentMethodDrawer';
import UpdateCreditCardDrawer from './UpdateCreditCardDrawer';
import DeletePaymentMethodDialog from 'src/components/PaymentMethodRow/DeletePaymentMethodDialog';
import { queryClient } from 'src/queries/base';
import { queryKey } from 'src/queries/accountPayment';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  root: {
    display: 'flex',
  },
  summarySectionHeight: {
    flex: '0 1 auto',
    width: '100%',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  billingGroup: {
    marginBottom: theme.spacing(3),
  },
  googlePayNoticeContainer: {
    marginTop: theme.spacing(2),
    padding: `8px 0px`,
  },
  googlePayNotice: {
    marginLeft: theme.spacing(),
  },
  edit: {
    color: theme.cmrTextColors.linkActiveLight,
    fontFamily: theme.font.normal,
    fontSize: '.875rem',
    fontWeight: 700,
    marginBottom: theme.spacing(2),
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
  const [editDrawerOpen, setEditDrawerOpen] = React.useState<boolean>(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(
    false
  );
  const [deleteError, setDeleteError] = React.useState<string | undefined>();
  const [deleteLoading, setDeleteLoading] = React.useState<boolean>(false);
  const [deleteId, setDeleteId] = React.useState<number>(-1);

  const classes = useStyles();
  const flags = useFlags();
  const { replace } = useHistory();

  const drawerLink = '/account/billing/add-payment-method';
  const addPaymentMethodRouteMatch = Boolean(useRouteMatch(drawerLink));

  const isGooglePayEnabled = flags.additionalPaymentMethods?.includes(
    'google_pay'
  );

  const showGooglePayAvailableNotice =
    isGooglePayEnabled &&
    !paymentMethods?.some(
      (paymetMethod: PaymentMethod) => paymetMethod.type === 'google_pay'
    );

  const doDelete = () => {
    setDeleteLoading(true);
    deletePaymentMethod(deleteId)
      .then(() => {
        setDeleteLoading(false);
        queryClient.invalidateQueries(`${queryKey}-all`);
      })
      .catch((e) => {
        setDeleteLoading(false);
        setDeleteError(
          getAPIErrorOrDefault(e, 'Error deleting domain.')[0].reason
        );
      });
  };

  const openAddDrawer = React.useCallback(() => setAddDrawerOpen(true), []);

  const closeAddDrawer = React.useCallback(() => {
    setAddDrawerOpen(false);
    replace('/account/billing');
  }, [replace]);

  const openEditDrawer = () => {
    setEditDrawerOpen(true);
  };

  const closeEditDrawer = () => {
    setEditDrawerOpen(false);
  };

  const openDeleteDialog = (id: number) => {
    setDeleteId(id);
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
    <Grid className={classes.root} item xs={12} md={6}>
      <Paper
        className={`${classes.summarySection} ${classes.summarySectionHeight}`}
        data-qa-billing-summary
      >
        <div className={classes.container}>
          <Typography variant="h3" className={classes.title}>
            Payment Methods
          </Typography>

          {isGooglePayEnabled ? (
            <Button
              className={classes.edit}
              onClick={() => replace(drawerLink)}
            >
              Add Payment Method
            </Button>
          ) : null}
        </div>
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
              key={paymentMethod.type}
              paymentMethod={paymentMethod}
              onEdit={
                paymentMethod.type === 'credit_card'
                  ? openEditDrawer
                  : undefined
              }
              onDelete={() => openDeleteDialog(paymentMethod.id)}
            />
          ))
        )}
        {showGooglePayAvailableNotice ? (
          <DismissibleBanner
            className={classes.googlePayNoticeContainer}
            preferenceKey="google-pay-available-notification"
          >
            <Box display="flex" alignItems="center">
              <GooglePay width={16} height={16} />
              <Typography className={classes.googlePayNotice}>
                Google Pay is now available for recurring payments.{' '}
                <Link to="#" onClick={() => replace(drawerLink)}>
                  Add Google Pay
                </Link>
              </Typography>
            </Box>
          </DismissibleBanner>
        ) : null}
        <UpdateCreditCardDrawer
          open={editDrawerOpen}
          onClose={closeEditDrawer}
        />
        <AddPaymentMethodDrawer
          open={addDrawerOpen}
          onClose={closeAddDrawer}
          paymentMethods={paymentMethods}
        />
        <DeletePaymentMethodDialog
          open={deleteDialogOpen}
          onClose={closeDeleteDialog}
          onDelete={doDelete}
          id={deleteId}
          loading={deleteLoading}
          error={deleteError}
        />
      </Paper>
    </Grid>
  );
};

export default React.memo(PaymentInformation);

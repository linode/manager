import * as React from 'react';
import { PaymentMethod } from '@linode/api-v4/lib/account';
import { useSnackbar, VariantType } from 'notistack';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import GooglePayChip from '../GooglePayChip';
import AddCreditCardForm from './AddCreditCardForm';
import useFlags from 'src/hooks/useFlags';
import Notice from 'src/components/Notice';

interface Props {
  open: boolean;
  onClose: () => void;
  paymentMethods: PaymentMethod[] | undefined;
}

const useStyles = makeStyles((theme: Theme) => ({
  methodGroup: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  root: {
    marginTop: 4,
  },
  progress: {
    marginBottom: 18,
    width: '100%',
    height: 5,
  },
  tooltip: {
    color: theme.color.grey1,
    padding: '0 0 0 4px',
    '& svg': {
      height: 20,
      width: 20,
    },
  },
  notice: {
    borderLeft: `solid 6px ${theme.color.green}`,
    marginBottom: theme.spacing(2),
    padding: '8px 16px',
    '& p': {
      fontSize: '0.95em',
    },
  },
  link: {
    ...theme.applyLinkStyles,
  },
}));

export const AddPaymentMethodDrawer: React.FC<Props> = (props) => {
  const { onClose, open, paymentMethods } = props;
  const classes = useStyles();
  const flags = useFlags();
  const { enqueueSnackbar } = useSnackbar();
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (open) {
      setIsProcessing(false);
    }
  }, [open]);

  const makeToast = (message: string, variant: VariantType) => {
    enqueueSnackbar(message, {
      variant,
    });
  };

  // @TODO: Use env varible or feature flag?
  const hasMaxPaymentMethods = paymentMethods
    ? paymentMethods.length >= 6
    : false;

  const isGooglePayEnabled = flags.additionalPaymentMethods?.includes(
    'google_pay'
  );

  return (
    <Drawer title="Add Payment Method" open={open} onClose={onClose}>
      {isProcessing ? <LinearProgress className={classes.progress} /> : null}
      {hasMaxPaymentMethods ? (
        <Notice
          warning
          text="You have the max amount of payment methods on your account. Delete an existing payment method to add a new one."
        />
      ) : null}
      {isGooglePayEnabled ? (
        <React.Fragment>
          <Divider />
          <Grid className={classes.root} container>
            <Grid item xs={8} md={9}>
              <Typography variant="h3">Google Pay</Typography>
              <Typography>
                You&apos;ll be taken to Google Pay to complete sign up.
              </Typography>
            </Grid>
            <Grid
              container
              item
              xs={4}
              md={3}
              justify="flex-end"
              alignContent="center"
            >
              <GooglePayChip
                disabled={isProcessing || hasMaxPaymentMethods}
                makeToast={makeToast}
                onClose={onClose}
                setProcessing={setIsProcessing}
              />
            </Grid>
          </Grid>
        </React.Fragment>
      ) : null}
      <React.Fragment>
        <Divider spacingBottom={16} spacingTop={16} />
        <Typography variant="h3">Credit Card</Typography>
        <AddCreditCardForm
          hasNoPaymentMethods={paymentMethods?.length === 0}
          disabled={isProcessing || hasMaxPaymentMethods}
          onClose={onClose}
        />
      </React.Fragment>
    </Drawer>
  );
};

export default AddPaymentMethodDrawer;

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
import HelpIcon from 'src/components/HelpIcon';
import useFlags from 'src/hooks/useFlags';

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

  const numberOfCreditCards = paymentMethods?.filter(
    (method: PaymentMethod) => method.type === 'credit_card'
  ).length;

  const isGPayAlreadyAdded = paymentMethods?.some(
    (method: PaymentMethod) => method.type === 'google_pay'
  );

  const isGooglePayEnabled = flags.additionalPaymentMethods?.includes(
    'google_pay'
  );

  return (
    <Drawer title="Add Payment Method" open={open} onClose={onClose}>
      {isProcessing ? <LinearProgress className={classes.progress} /> : null}
      {isGooglePayEnabled ? (
        <React.Fragment>
          <Divider />
          <Grid className={classes.root} container>
            <Grid item xs={8} md={9}>
              <Typography variant="h3">Google Pay</Typography>
              {isGPayAlreadyAdded ? (
                <Typography>
                  Currently, you may only have one Google Pay payment method on
                  your account.
                  <HelpIcon
                    data-qa-tooltip-icon
                    text={
                      'Adding another will replace your current Google Pay payment method.'
                    }
                    tooltipPosition="bottom"
                    className={classes.tooltip}
                  />
                </Typography>
              ) : (
                <Typography>
                  You&apos;ll be taken to Google Pay to complete sign up.
                </Typography>
              )}
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
                disabled={isProcessing}
                makeToast={makeToast}
                onClose={onClose}
                setProcessing={setIsProcessing}
              />
            </Grid>
          </Grid>
        </React.Fragment>
      ) : null}
      {numberOfCreditCards === 0 ? (
        <React.Fragment>
          <Divider spacingBottom={16} spacingTop={16} />
          <Typography variant="h3">Credit Card</Typography>
          <AddCreditCardForm onClose={onClose} />
        </React.Fragment>
      ) : null}
    </Drawer>
  );
};

export default AddPaymentMethodDrawer;

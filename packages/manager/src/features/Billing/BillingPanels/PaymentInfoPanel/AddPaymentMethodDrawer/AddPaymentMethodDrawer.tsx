import * as React from 'react';
import { PaymentMethod } from '@linode/api-v4/lib/account';
import { VariantType } from 'notistack';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import GooglePayChip from '../GooglePayChip';
import AddCreditCardForm from './AddCreditCardForm';
import Notice from 'src/components/Notice';
import { MAXIMUM_PAYMENT_METHODS } from 'src/constants';
import { PayPalChip } from '../PayPalChip';
import PayPalErrorBoundary from '../PayPalErrorBoundary';
import HelpIcon from 'src/components/HelpIcon';

interface Props {
  open: boolean;
  onClose: () => void;
  paymentMethods: PaymentMethod[] | undefined;
}

export interface PaymentMessage {
  text: string;
  variant: VariantType;
}

const useStyles = makeStyles((theme: Theme) => ({
  methodGroup: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  root: {
    marginTop: 4,
    marginBottom: 4,
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
  errorIcon: {
    color: theme.color.red,
    marginRight: -20,
    '&:hover': {
      color: theme.color.red,
      opacity: 0.7,
    },
    '& svg': {
      height: 28,
      width: 28,
    },
  },
}));

export const AddPaymentMethodDrawer: React.FC<Props> = (props) => {
  const { onClose, open, paymentMethods } = props;

  const classes = useStyles();

  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = React.useState<
    PaymentMessage | undefined
  >(undefined);

  React.useEffect(() => {
    if (open) {
      setIsProcessing(false);
      setNoticeMessage(undefined);
    }
  }, [open]);

  const setMessage = (message: PaymentMessage) => {
    setNoticeMessage(message);
  };

  const renderError = (errorMsg: string) => {
    return (
      <HelpIcon className={classes.errorIcon} isError={true} text={errorMsg} />
    );
  };

  const hasMaxPaymentMethods = paymentMethods
    ? paymentMethods.length >= MAXIMUM_PAYMENT_METHODS
    : false;

  const disabled = isProcessing || hasMaxPaymentMethods;

  return (
    <Drawer title="Add Payment Method" open={open} onClose={onClose}>
      {isProcessing ? <LinearProgress className={classes.progress} /> : null}
      {hasMaxPaymentMethods ? (
        <Notice
          warning
          text="You reached the maximum number of payment methods on your account. Delete an existing payment method to add a new one."
        />
      ) : null}
      {noticeMessage ? (
        <Notice
          error={noticeMessage.variant === 'error'}
          warning={noticeMessage.variant === 'warning'}
          text={noticeMessage.text}
        />
      ) : null}
      <>
        <Divider />
        <Grid className={classes.root} container>
          <Grid item xs={8} md={9}>
            <Typography variant="h3">Google Pay</Typography>
            <Typography>
              You&rsquo;ll be taken to Google Pay to complete sign up.
            </Typography>
          </Grid>
          <Grid
            container
            item
            xs={4}
            md={3}
            justifyContent="flex-end"
            alignContent="center"
          >
            <GooglePayChip
              disabled={disabled}
              setMessage={setMessage}
              onClose={onClose}
              setProcessing={setIsProcessing}
              renderError={renderError}
            />
          </Grid>
        </Grid>
      </>
      <>
        <Divider />
        <Grid className={classes.root} container>
          <Grid item xs={8} md={9}>
            <Typography variant="h3">PayPal</Typography>
            <Typography>
              You&rsquo;ll be taken to PayPal to complete sign up.
            </Typography>
          </Grid>
          <Grid
            container
            item
            xs={4}
            md={3}
            justifyContent="flex-end"
            alignContent="center"
          >
            <PayPalErrorBoundary renderError={renderError}>
              <PayPalChip
                onClose={onClose}
                setProcessing={setIsProcessing}
                renderError={renderError}
                disabled={disabled}
              />
            </PayPalErrorBoundary>
          </Grid>
        </Grid>
      </>
      <>
        <Divider spacingBottom={16} />
        <Typography variant="h3">Credit Card</Typography>
        <AddCreditCardForm disabled={disabled} onClose={onClose} />
      </>
    </Drawer>
  );
};

export default AddPaymentMethodDrawer;

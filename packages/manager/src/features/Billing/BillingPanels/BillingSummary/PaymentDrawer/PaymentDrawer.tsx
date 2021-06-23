import { APIWarning } from '@linode/api-v4/lib/types';
import { CardType } from '@linode/api-v4/lib/account/types';
import * as classnames from 'classnames';
import * as React from 'react';
import makeAsyncScriptLoader from 'react-async-script';
import { compose } from 'recompose';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import Drawer from 'src/components/Drawer';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import SupportLink from 'src/components/SupportLink';
import TextField from 'src/components/TextField';
import AccountContainer, {
  DispatchProps as AccountDispatchProps,
} from 'src/containers/account.container';
import useFlags from 'src/hooks/useFlags';
import { v4 } from 'uuid';
import CreditCardPayment from './CreditCardPayment';
import PayPal, { paypalScriptSrc } from './Paypal';
import { SetSuccess } from './types';
import GooglePayButton from './GooglePayButton';

// @TODO: remove unused code and feature flag logic once google pay is released
const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  currentBalance: {
    fontSize: '1.1rem',
    marginBottom: theme.spacing(4),
  },
  credit: {
    color: '#02b159',
  },
  header: {
    fontSize: '1.1rem',
    marginBottom: theme.spacing(4),
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
}

interface AccountContextProps {
  accountLoading: boolean;
  balance: false | number;
  lastFour: string;
  expiry: string;
  type?: CardType | null;
}

export type CombinedProps = Props & AccountContextProps & AccountDispatchProps;

export const getMinimumPayment = (balance: number | false) => {
  if (!balance || balance <= 0) {
    return '5.00';
  }
  /**
   * We follow the API's validation logic:
   *
   * If balance > 5 then min payment is $5
   * If balance < 5 but > 0, min payment is their balance
   * If balance < 0 then min payment is $5
   */
  return Math.min(5, balance).toFixed(2);
};

const AsyncPaypal = makeAsyncScriptLoader(paypalScriptSrc())(PayPal);

export const PaymentDrawer: React.FC<CombinedProps> = (props) => {
  const {
    accountLoading,
    balance,
    type,
    expiry,
    lastFour,
    open,
    onClose,
  } = props;
  const classes = useStyles();
  const flags = useFlags();

  const showGooglePay = flags.additionalPaymentMethods?.includes('google_pay');

  const [usd, setUSD] = React.useState<string>(getMinimumPayment(balance));
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [warning, setWarning] = React.useState<APIWarning | null>(null);

  const [creditCardKey, setCreditCardKey] = React.useState<string>(v4());
  const [payPalKey, setPayPalKey] = React.useState<string>(v4());
  const [
    isPaypalScriptLoaded,
    setIsPaypalScriptLoaded,
  ] = React.useState<boolean>(false);

  React.useEffect(() => {
    setUSD(getMinimumPayment(balance));
  }, [balance]);

  React.useEffect(() => {
    if (open) {
      setSuccessMessage(null);
      setWarning(null);
    }
  }, [open]);

  const handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUSD(e.target.value || '');
  };

  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formattedUSD = Number(e.target.value).toFixed(2) || '';
    setUSD(formattedUSD);
  };

  const setSuccess: SetSuccess = (
    message,
    paymentWasMade = false,
    warnings = undefined
  ) => {
    setSuccessMessage(message);
    if (paymentWasMade) {
      // Reset everything
      setUSD('0.00');
      setCreditCardKey(v4());
      setPayPalKey(v4());
      props.requestAccount();
    }
    if (warnings && warnings.length > 0) {
      setWarning(warnings[0]);
    }
  };

  const minimumPayment = getMinimumPayment(balance || 0);

  if (!accountLoading && balance === undefined) {
    return (
      <Grid container>
        <ErrorState errorText="You are not authorized to view billing information" />
      </Grid>
    );
  }

  const onScriptLoad = () => {
    setIsPaypalScriptLoaded(true);
  };

  return (
    <Drawer title="Make a Payment" open={open} onClose={onClose}>
      <Grid container>
        <Grid item xs={12}>
          {successMessage && <Notice success text={successMessage ?? ''} />}
          {warning ? <Warning warning={warning} /> : null}
          {balance !== false && (
            <Grid item>
              <Typography variant="h3" className={classes.currentBalance}>
                <strong>
                  Current balance:{' '}
                  <span
                    className={classnames({ [classes.credit]: balance < 0 })}
                  >
                    <Currency quantity={Math.abs(balance)} />
                    {balance < 0 ? ' Credit' : ''}
                  </span>
                </strong>
              </Typography>
            </Grid>
          )}
          <Grid item xs={6}>
            <TextField
              label="Payment Amount"
              onChange={handleUSDChange}
              onBlur={handleOnBlur}
              value={usd}
              required
              type="number"
              placeholder={`${minimumPayment} minimum`}
            />
          </Grid>
          <Divider spacingTop={32} spacingBottom={16} />
          <CreditCardPayment
            key={creditCardKey}
            type={type}
            lastFour={lastFour}
            expiry={expiry}
            usd={usd}
            minimumPayment={minimumPayment}
            setSuccess={setSuccess}
          />
          <Divider spacingTop={32} spacingBottom={16} />
          {showGooglePay ? (
            <>
              <Grid item>
                <Typography variant="h3" className={classes.header}>
                  <strong>Or pay via:</strong>
                </Typography>
              </Grid>
              <Grid container item wrap="nowrap">
                <AsyncPaypal
                  key={payPalKey}
                  usd={usd}
                  setSuccess={setSuccess}
                  asyncScriptOnLoad={onScriptLoad}
                  isScriptLoaded={isPaypalScriptLoaded}
                />
                <Grid item xs={6}>
                  <GooglePayButton
                    transactionInfo={{
                      totalPriceStatus: 'FINAL',
                      currencyCode: 'USD',
                      countryCode: 'US',
                      totalPrice: usd,
                    }}
                    balance={balance}
                    setSuccess={setSuccess}
                  />
                </Grid>
              </Grid>
            </>
          ) : (
            <AsyncPaypal
              key={payPalKey}
              usd={usd}
              setSuccess={setSuccess}
              asyncScriptOnLoad={onScriptLoad}
              isScriptLoaded={isPaypalScriptLoaded}
            />
          )}
        </Grid>
      </Grid>
    </Drawer>
  );
};

interface WarningProps {
  warning: APIWarning;
}

const Warning: React.FC<WarningProps> = (props) => {
  const { warning } = props;
  /** The most common API warning includes "please open a Support ticket",
   * which we'd like to be a link.
   */
  const ticketLink = warning.detail.match(/open a support ticket\./i) ? (
    <>
      {warning.detail.replace(/open a support ticket\./i, '')}
      <SupportLink
        text="open a Support ticket"
        title={`Re: ${warning.detail}`}
      />
      .
    </>
  ) : (
    warning.detail
  );
  const message = (
    <>
      {warning.title} {ticketLink}
    </>
  );
  return <Notice warning>{message}</Notice>;
};

const withAccount = AccountContainer(
  (ownProps, { accountLoading, accountData }) => ({
    accountLoading,
    balance: accountData?.balance ?? false,
    type: accountData?.credit_card.card_type ?? '',
    lastFour: accountData?.credit_card.last_four ?? '',
    expiry: accountData?.credit_card.expiry ?? '',
  })
);

export default compose<CombinedProps, Props>(withAccount)(PaymentDrawer);

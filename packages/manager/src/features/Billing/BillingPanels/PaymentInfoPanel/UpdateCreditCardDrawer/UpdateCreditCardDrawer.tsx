import { APIError } from '@linode/api-v4/lib/types';
// eslint-disable-next-line no-restricted-imports
import { InputBaseComponentProps } from '@material-ui/core';
import { take } from 'ramda';
import * as React from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';
import { Link } from 'react-router-dom';
// import AcceptedCards from 'src/assets/icons/accepted-cards.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { cleanCVV } from 'src/features/Billing/billingUtils';
import useFlags from 'src/hooks/useFlags';
import { queryClient } from 'src/queries/base';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { addPaymentMethod } from '@linode/api-v4/lib/account/payments';
import { useSnackbar } from 'notistack';
import { PaymentMethod } from '@linode/api-v4/lib/account';
import { useAllPaymentMethodsQuery } from 'src/queries/accountPayment';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: -theme.spacing(3),
  },
  cards: {
    marginTop: 6,
  },
  cardDetails: {
    marginTop: -theme.spacing(2),
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

export const CreditCardAddressMessage: React.FC<{}> = () => (
  <Typography>
    The address affiliated with this credit card must match the{' '}
    <Link
      to={{
        pathname: '/account/billing',
        state: { contactDrawerOpen: true },
      }}
    >
      contact information
    </Link>{' '}
    active on this account.
  </Typography>
);

export interface Props {
  open: boolean;
  onClose: () => void;
}

export const UpdateCreditCardDrawer: React.FC<Props> = (props) => {
  const { data: paymentMethods } = useAllPaymentMethodsQuery();

  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesXSDown = useMediaQuery(theme.breakpoints.down('xs'));
  const { enqueueSnackbar } = useSnackbar();

  const { onClose, open } = props;

  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [success, setSuccess] = React.useState<boolean>();
  const [cardNumber, setCardNumber] = React.useState<string>('');
  const [expDate, setExpDate] = React.useState<string>('');
  const [cvv, setCVV] = React.useState<string>('');

  const flags = useFlags();

  React.useEffect(() => {
    if (open) {
      resetForm(undefined);
    }
  }, [open]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(e.target.value ? take(19, e.target.value) : '');
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const _expDate = e.target.value ? take(7, e.target.value) : '';
    setExpDate(_expDate);
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const _cvv = cleanCVV(e.target.value);
    setCVV(_cvv);
  };

  const submitForm = () => {
    setSubmitting(true);
    setErrors(undefined);

    // MM/YYYY
    const _date = expDate.match(/(\-?[0-9][0-9]?)\/?([0-9]+)/);
    const expMonth = _date ? +_date[1] : -1;
    let expYear = _date ? +_date?.[2] : -1;

    // Handles if the user tries to use two digit year
    if (expYear < 100) {
      expYear += 2000;
    }

    if (expYear >= 100 && expYear < 1000) {
      setSubmitting(false);
      setErrors([
        {
          field: 'expiry_year',
          reason: 'Expiration date must have the format MM/YY.',
        },
      ]);
      return;
    }

    /**
     * Make the user's credit card default if
     * - They have no payment methods
     * - Their previous default payment method was a credit card
     *
     * We determined this to make sure a user's payment method
     * does not abruptly switch after "Editing" it.
     * @TODO remove this logic when user can have more payment methods
     */
    const shouldBecomeDefault =
      paymentMethods?.length === 0 ||
      paymentMethods?.find(
        (method: PaymentMethod) => method.is_default === true
      )?.type === 'credit_card';

    addPaymentMethod({
      type: 'credit_card',
      is_default: shouldBecomeDefault,
      data: {
        card_number: cardNumber,
        expiry_month: expMonth,
        expiry_year: expYear,
        cvv,
      },
    })
      .then(() => {
        queryClient.invalidateQueries('account-payment-methods-all');
        enqueueSnackbar('Successfully updated your credit card.', {
          variant: 'success',
        });
        resetForm(true);
        setSubmitting(false);
        onClose();
      })
      .catch((error) => {
        setSubmitting(false);
        setErrors(getAPIErrorOrDefault(error, 'Unable to update credit card.'));
      });
  };

  const resetForm = (_success: boolean | undefined) => {
    setErrors(undefined);
    setCardNumber('');
    setExpDate('');
    setCVV('');
    setSuccess(_success);
  };

  const hasErrorFor = getErrorMap(
    ['card_number', 'expiry_month', 'expiry_year', 'cvv'],
    errors
  );
  const generalError = hasErrorFor.none;

  const cvvLabel = flags.cvvRequired ? 'CVV' : 'CVV (optional)';

  return (
    <Drawer title="Edit Credit Card" open={open} onClose={onClose}>
      {generalError && (
        <Notice error spacingBottom={16}>
          {generalError}
        </Notice>
      )}
      {success && (
        <Notice success spacingBottom={16}>
          Credit card successfully updated.
        </Notice>
      )}
      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <TextField
            label="Credit Card Number"
            value={cardNumber}
            onChange={handleCardNumberChange}
            errorText={hasErrorFor.card_number}
            InputProps={{
              inputComponent: creditCardField,
            }}
          />
          {/* <AcceptedCards className={classes.cards} /> */}
        </Grid>
        <Grid item className={classes.cardDetails} xs={12} sm={6}>
          <TextField
            label="Expiration Date"
            value={expDate}
            onChange={handleExpiryDateChange}
            errorText={hasErrorFor.expiry_month || hasErrorFor.expiry_year}
            placeholder={'MM/YY'}
          />
        </Grid>
        <Grid item className={classes.cardDetails} xs={12} sm={6}>
          <TextField
            label={cvvLabel}
            value={cvv}
            onChange={handleCVVChange}
            errorText={hasErrorFor.cvv}
          />
        </Grid>
        <Grid item xs={12}>
          <CreditCardAddressMessage />
        </Grid>
      </Grid>
      <ActionsPanel className={classes.actions}>
        <Button
          buttonType="cancel"
          compact={matchesXSDown}
          onClick={() => {
            resetForm(undefined);
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button buttonType="primary" onClick={submitForm} loading={submitting}>
          Save Credit Card
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

export interface CreditCardFormProps extends NumberFormatProps {
  inputRef: React.Ref<any>;
  onChange: any;
}

type CombinedCreditCardFormProps = CreditCardFormProps &
  InputBaseComponentProps;

export const creditCardField: React.FC<CombinedCreditCardFormProps> = ({
  inputRef,
  onChange,
  ...other
}) => {
  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
      format="#### #### #### #######"
    />
  );
};

export default UpdateCreditCardDrawer;

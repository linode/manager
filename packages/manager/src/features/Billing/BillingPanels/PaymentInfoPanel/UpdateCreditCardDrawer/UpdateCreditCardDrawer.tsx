import { saveCreditCard } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import { take, takeLast } from 'ramda';
import * as React from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import accountContainer, {
  Props as AccountContainerProps
} from 'src/containers/account.container';
import { cleanCVV } from 'src/features/Billing/billingUtils';
import { getErrorMap, getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  expired: {
    color: theme.color.red
  },
  newccContainer: {
    padding: `${theme.spacing(1)}px 0 0`
  },
  currentCCTitle: {
    marginBottom: theme.spacing(1)
  },
  cardNumber: {
    minWidth: 225
  },
  fullWidthMobile: {
    flexBasis: '50%',
    [theme.breakpoints.down('xs')]: {
      width: '100%'
    }
  }
}));

export interface Props {
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props & AccountContainerProps;

export const UpdateCreditCardDrawer: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { onClose, open } = props;

  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [success, setSuccess] = React.useState<boolean>();
  const [cardNumber, setCardNumber] = React.useState<string>('');
  const [expDate, setExpDate] = React.useState<string>('');
  const [cvv, setCVV] = React.useState<string>('');

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

    // Checks to see if date matches the format MM/YY
    // If not, don't submit
    const clean = expDate.replace(/[^0-9]/g, '');

    // Checks how many digits are after '/'
    const year = expDate.match(/([^\/][\d]+$)/);
    const yearLength = year?.length ? year.length : 0;

    if (clean.length < 3 || yearLength < 2) {
      setSubmitting(false);
      setErrors([
        {
          field: 'expiry_year',
          reason: 'Expiration date must have the format MM/YY.'
        }
      ]);
    } else {
      const expMonth = parseExpiryDate(expDate).expMonth;
      const expYear = parseExpiryDate(expDate).expYear;

      saveCreditCard({
        card_number: cardNumber,
        expiry_month: expMonth,
        expiry_year: expYear,
        cvv
      })
        .then(() => {
          const credit_card = {
            last_four: takeLast(4, cardNumber),
            expiry: `${String(expMonth).padStart(2, '0')}/${expYear}`,
            cvv
          };
          // Update Redux store so subscribed components will display updated
          // information.
          props.saveCreditCard(credit_card);
          resetForm(true);
          setSubmitting(false);
          onClose();
        })
        .catch(error => {
          setSubmitting(false);
          setErrors(
            getAPIErrorOrDefault(error, 'Unable to update credit card.')
          );
        });
    }
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

  return (
    <Drawer
      title="Edit Credit Card"
      open={open}
      onClose={() => {
        resetForm(undefined);
        onClose();
      }}
    >
      <Grid container className={classes.newccContainer}>
        <Grid item xs={12}>
          {generalError && (
            <Notice error spacingTop={24} spacingBottom={8}>
              {generalError}
            </Notice>
          )}
          {success && (
            <Notice success spacingTop={24} spacingBottom={8}>
              Credit card successfully updated.
            </Notice>
          )}
          <Grid container>
            <Grid item xs={12}>
              <TextField
                label="Credit Card Number"
                value={cardNumber}
                onChange={handleCardNumberChange}
                errorText={hasErrorFor.card_number}
                className={classes.cardNumber}
                InputProps={{
                  inputComponent: creditCardField
                }}
              />
            </Grid>
            <Grid item className={classes.fullWidthMobile}>
              <TextField
                label="Expiration Date"
                value={expDate}
                onChange={handleExpiryDateChange}
                errorText={hasErrorFor.expiry_month || hasErrorFor.expiry_year}
                placeholder={'MM/YY'}
              />
            </Grid>
            <Grid item className={classes.fullWidthMobile}>
              <TextField
                label="CVV (optional)"
                value={cvv}
                onChange={handleCVVChange}
                errorText={hasErrorFor.cvv}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <ActionsPanel>
        <Button buttonType="primary" onClick={submitForm} loading={submitting}>
          Save
        </Button>
        <Button
          buttonType="cancel"
          onClick={() => {
            resetForm(undefined);
            onClose();
          }}
        >
          Cancel
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

export const parseExpiryDate = (date: string) => {
  const clean = date.replace(/[^0-9]/g, '');
  const yearLength = clean.length > 4 ? 4 : 2;
  const month = +clean.substring(0, clean.length - yearLength);
  const year = +clean.substring(clean.length - yearLength);

  return {
    expYear: year + (yearLength == 4 ? 0 : 2000),
    expMonth: month
  };
};

export interface CreditCardFormProps extends NumberFormatProps {
  inputRef: React.Ref<any>;
  onChange: any;
}

const creditCardField = (props: CreditCardFormProps) => {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            value: values.value
          }
        });
      }}
      format="#### #### #### #######"
    />
  );
};

const enhanced = compose<CombinedProps, Props>(accountContainer());

export default enhanced(UpdateCreditCardDrawer);

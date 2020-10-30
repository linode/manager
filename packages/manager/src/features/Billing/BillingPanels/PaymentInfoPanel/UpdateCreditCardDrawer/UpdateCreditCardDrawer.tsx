import { saveCreditCard } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
// eslint-disable-next-line no-restricted-imports
import { InputBaseComponentProps } from '@material-ui/core';
import { take, takeLast } from 'ramda';
import * as React from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import accountContainer, {
  Props as AccountContainerProps
} from 'src/containers/account.container';
import { cleanCVV } from 'src/features/Billing/billingUtils';
import useFlags from 'src/hooks/useFlags';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

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
          reason: 'Expiration date must have the format MM/YY.'
        }
      ]);
      return;
    }

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
        // Manually handle "CVV required" errors until the API change is made.
        // Once that happens, update account.schema to make it a required field.
        if (flags.cvvRequired && !cvv && Array.isArray(error)) {
          error.push({ reason: 'CVV is required.', field: 'cvv' });
        }
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
                label={cvvLabel}
                value={cvv}
                onChange={handleCVVChange}
                errorText={hasErrorFor.cvv}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} style={{ marginTop: 16 }}>
            <Typography>
              The address affiliated with this credit card must match the{' '}
              <Link
                to={{
                  pathname: '/account',
                  state: { contactDrawerOpen: true }
                }}
              >
                contact information
              </Link>{' '}
              active on this account.
            </Typography>
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

export interface CreditCardFormProps extends NumberFormatProps {
  inputRef: React.Ref<any>;
  onChange: any;
}

type CombinedCreditCardFormProps = CreditCardFormProps &
  InputBaseComponentProps;

const creditCardField: React.FC<CombinedCreditCardFormProps> = ({
  inputRef,
  onChange,
  ...other
}) => {
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

import * as React from 'react';
import { useFormik } from 'formik';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { addPaymentMethod } from '@linode/api-v4/lib';
import { useSnackbar } from 'notistack';
import Notice from 'src/components/Notice';
import { queryClient } from 'src/queries/base';
import {
  CreditCardAddressMessage,
  creditCardField,
} from '../UpdateCreditCardDrawer/UpdateCreditCardDrawer';
import { CreditCardSchema } from '@linode/validation';
import { take } from 'ramda';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  error: {
    marginTop: theme.spacing(2),
  },
  notice: {
    marginTop: theme.spacing(2),
  },
}));

interface Props {
  onClose: () => void;
}

interface Values {
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  is_default: boolean;
  address: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const AddCreditCardForm = (props: Props) => {
  const [error, setError] = React.useState<string>();
  const { onClose } = props;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const addCreditCard = async (
    { card_number, cvv, expiry_month, expiry_year, is_default }: Values,
    {
      setSubmitting,
      setFieldError,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      setFieldError: (field: string, reason: string) => void;
    }
  ) => {
    setError(undefined);
    setSubmitting(true);

    try {
      await addPaymentMethod({
        type: 'credit_card',
        is_default,
        data: {
          card_number,
          cvv,
          expiry_month: Number(expiry_month),
          expiry_year: Number(expiry_year),
        },
      });
      enqueueSnackbar('Successfully added Credit Card', {
        variant: 'success',
      });
      queryClient.invalidateQueries('account-payment-methods-all');
      onClose();
    } catch (errors) {
      handleAPIErrors(errors, setFieldError, setError);
    }

    setSubmitting(false);
  };

  // const countryResults: Item<string>[] = countryData.map((country: Country) => {
  //   return {
  //     value: country.countryShortCode,
  //     label: country.countryName,
  //   };
  // });

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    initialValues: {
      card_number: '',
      expiry_month: '',
      expiry_year: '',
      cvv: '',
      is_default: true,
      address: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
    onSubmit: addCreditCard,
    validationSchema: CreditCardSchema,
  });

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Grid item xs={12} className={classes.error}>
          <Notice error text={error} />
        </Grid>
      )}
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <TextField
            name="card_number"
            value={values.card_number}
            onChange={(e) => setFieldValue('card_number', e.target.value)}
            label="Credit Card Number"
            error={touched.card_number && Boolean(errors.card_number)}
            errorText={touched.card_number ? errors.card_number : undefined}
            disabled={isSubmitting}
            InputProps={{
              inputComponent: creditCardField,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="expiry"
            // value={values.expiry}
            onChange={(e) => {
              const value: string[] = e.target.value.split('/');
              setFieldValue('expiry_month', value[0]);
              setFieldValue(
                'expiry_year',
                value[1]
                  ? take(2, String(new Date().getFullYear())) + value[1]
                  : undefined
              );
            }}
            label="Expiration Date"
            placeholder="MM/YY"
            error={
              (touched.expiry_month || touched.expiry_year) &&
              Boolean(errors.expiry_month || errors.expiry_year)
            }
            errorText={
              touched.expiry_month || touched.expiry_year
                ? errors.expiry_month || errors.expiry_year
                : undefined
            }
            disabled={isSubmitting}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="cvv"
            value={values.cvv}
            onChange={handleChange}
            label="Security Code"
            error={touched.cvv && Boolean(errors.cvv)}
            errorText={touched.cvv ? errors.cvv : undefined}
            disabled={isSubmitting}
          />
        </Grid>
        {/* <Grid item xs={12}>
          <TextField
            name="address"
            value={values.address}
            onChange={handleChange}
            label="Address"
            error={Boolean(errors.address)}
            errorText={errors.address}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="address2"
            value={values.address2}
            onChange={handleChange}
            label="Address 2"
            error={Boolean(errors.address2)}
            errorText={errors.address2}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            name="city"
            value={values.city}
            onChange={handleChange}
            label="City"
            error={Boolean(errors.city)}
            errorText={errors.city}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            name="state"
            value={values.state}
            onChange={handleChange}
            label="State / Province"
            error={Boolean(errors.state)}
            errorText={errors.state}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="zip"
            value={values.zip}
            onChange={handleChange}
            label="Zip / Postal Code"
            error={Boolean(errors.zip)}
            errorText={errors.zip}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <EnhancedSelect
            name="country"
            onChange={(data: Item<string>) => {
              setFieldValue('country', data.value);
            }}
            label="Country"
            placeholder="Select a Country"
            isClearable={false}
            options={countryResults}
            value={countryResults.find(
              (country) => country.label === values.country
            )}
            error={Boolean(errors.country)}
            errorText={errors.country}
          />
        </Grid>
      </Grid>
      <CheckBox
        text="Make default?"
        checked={values.is_default}
        onChange={() => setFieldValue('is_default', !values.is_default)}
      /> */}
      </Grid>
      <div className={classes.notice}>
        <CreditCardAddressMessage />
      </div>
      <ActionsPanel className={classes.actions}>
        <Button onClick={onClose} buttonType="secondary">
          Cancel
        </Button>
        <Button type="submit" buttonType="primary" loading={isSubmitting}>
          Add Credit Card
        </Button>
      </ActionsPanel>
    </form>
  );
};

export default AddCreditCardForm;

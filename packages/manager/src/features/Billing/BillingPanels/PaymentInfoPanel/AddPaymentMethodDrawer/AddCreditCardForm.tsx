import * as React from 'react';
import { useFormik } from 'formik';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect';
import countryData from 'country-region-data';
import { Country } from '../../ContactInfoPanel/UpdateContactInformationForm/types';
import { addPaymentMethod } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';
import { useSnackbar } from 'notistack';
import Notice from 'src/components/Notice';
import { queryClient } from 'src/queries/base';
import { getAllPaymentMethodsRequest } from 'src/queries/accountPayment';

const useStyles = makeStyles((theme: Theme) => ({
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  error: {
    marginTop: theme.spacing(2),
  },
}));

interface Props {
  onClose: () => void;
}

interface Values {
  card_number: string;
  expiry: string;
  cvv: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const keyMap = {
  expiry_month: 'expiry',
  exity_year: 'expiry',
};

const AddCreditCardForm = (props: Props) => {
  const [error, setError] = React.useState<string>();
  const { onClose } = props;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const addCreditCard = async (
    { card_number, cvv, expiry }: Values,
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
    const expireData = expiry.split('/');

    try {
      await addPaymentMethod({
        type: 'credit_card',
        is_default: true,
        data: {
          card_number,
          cvv,
          expiry_month: Number(expireData[0]),
          expiry_year: Number('20' + expireData[1]),
        },
      });
      enqueueSnackbar('Successfully added Credit Card', {
        variant: 'success',
      });
      await queryClient.refetchQueries(['account-payment-methods-all']);
      onClose();
    } catch (errors) {
      errors.forEach((error: APIError) => {
        if (error.field) {
          const key = error.field?.split('.')[
            error.field.split('.').length - 1
          ];
          if (key) {
            setFieldError(keyMap[key] || key, error.reason);
          }
        } else {
          setError(error.reason);
        }
      });
    }

    setSubmitting(false);
  };

  const countryResults: Item<string>[] = countryData.map((country: Country) => {
    return {
      value: country.countryShortCode,
      label: country.countryName,
    };
  });

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    initialValues: {
      card_number: '',
      expiry: '',
      cvv: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
    onSubmit: addCreditCard,
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
            onChange={handleChange}
            label="Credit Card Number"
            error={Boolean(errors.card_number)}
            errorText={errors.card_number}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="expiry"
            value={values.expiry}
            onChange={handleChange}
            label="Expiration Date"
            placeholder="MM/YY"
            error={Boolean(errors.expiry)}
            errorText={errors.expiry}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="cvv"
            value={values.cvv}
            onChange={handleChange}
            label="CVV"
            error={Boolean(errors.cvv)}
            errorText={errors.cvv}
          />
        </Grid>
        <Grid item xs={12}>
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

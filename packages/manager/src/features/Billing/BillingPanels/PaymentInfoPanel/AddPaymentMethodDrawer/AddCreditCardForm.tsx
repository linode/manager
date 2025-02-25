import { addPaymentMethod } from '@linode/api-v4/lib';
import { Notice, TextField } from '@linode/ui';
import { CreditCardSchema } from '@linode/validation';
import Grid from '@mui/material/Grid2';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik, yupToFormErrors } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import NumberFormat from 'react-number-format';
import { makeStyles } from 'tss-react/mui';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { accountQueries } from 'src/queries/account/queries';
import { parseExpiryYear } from 'src/utilities/creditCard';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';

import type { InputBaseComponentProps } from '@mui/material/InputBase/InputBase';
import type { Theme } from '@mui/material/styles';
import type { NumberFormatProps } from 'react-number-format';

const useStyles = makeStyles()((theme: Theme) => ({
  error: {
    marginTop: theme.spacing(2),
  },
  notice: {
    marginTop: theme.spacing(2),
  },
}));

const getExpirationDelimiter = (value: string | undefined) =>
  value?.match(/[^$,.\d]/);

interface Props {
  disabled: boolean;
  onClose: () => void;
}

interface Values {
  address: string;
  address2: string;
  card_number: string;
  city: string;
  country: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
  state: string;
  zip: string;
}

const AddCreditCardForm = (props: Props) => {
  const { disabled, onClose } = props;
  const [error, setError] = React.useState<string>();
  const { classes } = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const expiryRef = React.useRef<HTMLInputElement>(null);

  const addCreditCard = async (
    { card_number, cvv, expiry_month, expiry_year }: Values,
    {
      setFieldError,
      setSubmitting,
    }: {
      setFieldError: (field: string, reason: string) => void;
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => {
    setError(undefined);
    setSubmitting(true);

    try {
      await addPaymentMethod({
        data: {
          card_number,
          cvv,
          expiry_month: Number(expiry_month),
          expiry_year: Number(expiry_year),
        },
        is_default: true,
        type: 'credit_card',
      });
      enqueueSnackbar('Successfully added Credit Card', {
        variant: 'success',
      });
      queryClient.invalidateQueries({
        queryKey: accountQueries.paymentMethods.queryKey,
      });
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
    errors,
    handleChange,
    handleSubmit,
    isSubmitting,
    setFieldValue,
    touched,
    values,
  } = useFormik({
    initialValues: {
      address: '',
      address2: '',
      card_number: '',
      city: '',
      country: '',
      cvv: '',
      expiry_month: '',
      expiry_year: '',
      state: '',
      zip: '',
    },
    onSubmit: addCreditCard,
    validate: async (values) => {
      const expiryValue = expiryRef?.current?.value;
      const delimiter = getExpirationDelimiter(expiryValue);

      const errors = await CreditCardSchema.validate(values, {
        abortEarly: false,
      })
        .then(() => ({}))
        .catch((error) => yupToFormErrors(error));

      if (!delimiter) {
        return {
          ...errors,
          expiry_month:
            'Expiration must include a slash between the month and year (MM/YY).',
        };
      }

      return errors;
    },
  });

  const onExpiryChange = (value: string) => {
    const delimiter = getExpirationDelimiter(value);

    if (delimiter?.[0]) {
      const values: string[] = value.split(delimiter[0]);
      setFieldValue('expiry_month', values[0]);
      setFieldValue('expiry_year', parseExpiryYear(values[1]));
    } else {
      setFieldValue('expiry_month', value);
    }
  };

  const disableInput = isSubmitting || disabled;

  const disableAddButton =
    disabled || !values.card_number || !values.cvv || !values.expiry_month;

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Grid className={classes.error} size={12}>
          <Notice text={error} variant="error" />
        </Grid>
      )}
      <Grid container spacing={1}>
        <Grid size={12}>
          <TextField
            InputProps={{
              inputComponent: creditCardField,
            }}
            disabled={disableInput}
            error={touched.card_number && Boolean(errors.card_number)}
            errorText={touched.card_number ? errors.card_number : undefined}
            label="Credit Card Number"
            name="card_number"
            onChange={(e) => setFieldValue('card_number', e.target.value)}
            value={values.card_number}
          />
        </Grid>
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          <TextField
            error={
              (touched.expiry_month || touched.expiry_year) &&
              Boolean(errors.expiry_month || errors.expiry_year)
            }
            errorText={
              touched.expiry_month || touched.expiry_year
                ? errors.expiry_month || errors.expiry_year
                : undefined
            }
            disabled={disableInput}
            inputRef={expiryRef}
            label="Expiration Date"
            name="expiry"
            onChange={(e) => onExpiryChange(e.target.value)}
            placeholder="MM/YY"
          />
        </Grid>
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          <TextField
            disabled={disableInput}
            error={touched.cvv && Boolean(errors.cvv)}
            errorText={touched.cvv ? errors.cvv : undefined}
            label="Security Code"
            name="cvv"
            onChange={handleChange}
            value={values.cvv}
          />
        </Grid>
      </Grid>
      <ActionsPanel
        primaryButtonProps={{
          disabled: disableAddButton,
          label: 'Add Credit Card',
          loading: isSubmitting,
          type: 'submit',
        }}
        secondaryButtonProps={{
          disabled: disableInput,
          label: 'Cancel',
          onClick: onClose,
        }}
        style={{ marginTop: 0 }}
      />
    </form>
  );
};

export interface CreditCardFormProps extends NumberFormatProps {
  inputRef: React.Ref<any>;
  onChange: any;
}

type CombinedCreditCardFormProps = CreditCardFormProps &
  InputBaseComponentProps;

const creditCardField = ({
  inputRef,
  onChange,
  ...other
}: CombinedCreditCardFormProps) => {
  return (
    <NumberFormat
      {...other}
      onValueChange={(values) => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
      format="#### #### #### #######"
      getInputRef={inputRef}
    />
  );
};

export default AddCreditCardForm;

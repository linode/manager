import countryData, { Region } from 'country-region-data';
import { pathOr } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles } from 'tss-react/mui';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { getErrorMap } from 'src/utilities/errorUtils';
import { Country } from './types';
import { useAccount, useMutateAccount } from 'src/queries/account';
import { useFormik } from 'formik';
import useFlags from 'src/hooks/useFlags';
import { useNotificationsQuery } from 'src/queries/accountNotifications';

interface Props {
  onClose: () => void;
  focusEmail: boolean;
}

const excludedUSRegions = ['Micronesia', 'Marshall Islands', 'Palau'];

const UpdateContactInformationForm = ({ onClose, focusEmail }: Props) => {
  const { data: account } = useAccount();
  const { mutateAsync, isLoading, error } = useMutateAccount();
  const { data: notifications, refetch } = useNotificationsQuery();
  const { classes } = useStyles();
  const flags = useFlags();
  const emailRef = React.useRef<HTMLInputElement>();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: account?.email,
      first_name: account?.first_name,
      last_name: account?.last_name,
      company: account?.company,
      address_1: account?.address_1,
      address_2: account?.address_2,
      country: account?.country,
      state: account?.state,
      city: account?.city,
      zip: account?.zip,
      phone: account?.phone,
      tax_id: account?.tax_id,
    },
    async onSubmit(values) {
      await mutateAsync(values);

      // If there's a "billing_email_bounce" notification on the account, and
      // the user has just updated their email, re-request notifications to
      // potentially clear the email bounce notification.
      const hasBillingEmailBounceNotification = notifications?.find(
        (notification) => notification.type === 'billing_email_bounce'
      );

      if (hasBillingEmailBounceNotification) {
        refetch();
      }
      onClose();
    },
  });

  React.useEffect(() => {
    if (focusEmail && emailRef.current) {
      emailRef.current.focus();
      emailRef.current.scrollIntoView();
    }
  }, []);

  const errorMap = getErrorMap(
    [
      'address_1',
      'address_2',
      'city',
      'country',
      'company',
      'email',
      'first_name',
      'last_name',
      'phone',
      'state',
      'tax_id',
      'zip',
    ],
    error
  );

  const generalError = errorMap.none;

  const countryResults: Item<string>[] = countryData.map((country: Country) => {
    return {
      value: country.countryShortCode,
      label: country.countryName,
    };
  });

  const currentCountryResult = countryData.filter((country: Country) =>
    formik.values.country
      ? country.countryShortCode === formik.values.country
      : country.countryShortCode === account?.country
  );

  const countryRegions: Region[] = pathOr(
    [],
    ['0', 'regions'],
    currentCountryResult
  );

  const regionResults = countryRegions.map((region) => {
    if (formik.values.country === 'US' && region.name === 'Virgin Islands') {
      return {
        value: region.shortCode,
        label: 'Virgin Islands, U.S.',
      };
    }

    return {
      value: region.shortCode,
      label: region.name,
    };
  });

  let filteredRegionResults;

  if (formik.values.country === 'US') {
    filteredRegionResults = regionResults.filter(
      (region) => !excludedUSRegions.includes(region.label)
    );

    filteredRegionResults.push({
      value: 'UM',
      label: 'United States Minor Outlying Islands',
    });
  } else {
    filteredRegionResults = regionResults;
  }

  // Prevent edge case field error for "Company Name" when updating billing info
  // for accounts that did not initially require an address.
  if (formik.values.company === null) {
    formik.setFieldValue('company', '');
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid
        container
        className={classes.mainFormContainer}
        data-qa-update-contact
      >
        {generalError && (
          <Grid xs={12}>
            <Notice error text={generalError} />
          </Grid>
        )}
        <Grid
          item
          xs={12}
          updateFor={[formik.values.email, errorMap.email, classes]}
        >
          <TextField
            label="Email"
            errorText={errorMap.email}
            helperTextPosition="top"
            inputRef={emailRef}
            name="email"
            onChange={formik.handleChange}
            required
            type="email"
            value={formik.values.email}
            data-qa-contact-email
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          updateFor={[formik.values.first_name, errorMap.first_name, classes]}
        >
          <TextField
            label="First Name"
            errorText={errorMap.first_name}
            name="first_name"
            onChange={formik.handleChange}
            value={formik.values.first_name}
            data-qa-contact-first-name
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          updateFor={[formik.values.last_name, errorMap.last_name, classes]}
        >
          <TextField
            label="Last Name"
            name="last_name"
            errorText={errorMap.last_name}
            onChange={formik.handleChange}
            value={formik.values.last_name}
            data-qa-contact-last-name
          />
        </Grid>
        <Grid
          item
          xs={12}
          updateFor={[formik.values.company, errorMap.company, classes]}
        >
          <Grid item xs={12}>
            <TextField
              label="Company Name"
              name="company"
              errorText={errorMap.company}
              onChange={formik.handleChange}
              value={formik.values.company}
              data-qa-company
            />
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          updateFor={[formik.values.address_1, errorMap.address_1, classes]}
        >
          <TextField
            label="Address"
            name="address_1"
            errorText={errorMap.address_1}
            onChange={formik.handleChange}
            value={formik.values.address_1}
            data-qa-contact-address-1
          />
        </Grid>
        <Grid
          item
          xs={12}
          updateFor={[formik.values.address_2, errorMap.address_2, classes]}
        >
          <TextField
            label="Address 2"
            name="address_2"
            errorText={errorMap.address_2}
            onChange={formik.handleChange}
            value={formik.values.address_2}
            data-qa-contact-address-2
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          updateFor={[formik.values.country, errorMap.country, classes]}
        >
          <EnhancedSelect
            label="Country"
            errorText={errorMap.country}
            isClearable={false}
            onChange={(item: Item) =>
              formik.setFieldValue('country', item.value)
            }
            options={countryResults}
            placeholder="Select a Country"
            required={flags.regionDropdown}
            value={countryResults.find(
              ({ value }) => value === formik.values.country
            )}
            textFieldProps={{
              dataAttrs: {
                'data-qa-contact-country': true,
              },
            }}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          updateFor={[
            formik.values.state,
            formik.values.zip,
            formik.values.country,
            errorMap.state,
            errorMap.zip,
            errorMap.country,
            classes,
          ]}
        >
          {flags.regionDropdown &&
          (formik.values.country === 'US' || formik.values.country == 'CA') ? (
            <EnhancedSelect
              label={`${formik.values.country === 'US' ? 'State' : 'Province'}`}
              errorText={errorMap.state}
              isClearable={false}
              onChange={(item: Item) =>
                formik.setFieldValue('state', item.value)
              }
              options={filteredRegionResults}
              placeholder={
                formik.values.country === 'US' ? 'state' : 'province'
              }
              required={flags.regionDropdown}
              value={
                filteredRegionResults.find(
                  ({ value }) => value === formik.values.state
                ) ?? ''
              }
              textFieldProps={{
                'data-qa-contact-state-province': true,
              }}
            />
          ) : (
            <TextField
              label="State / Province"
              errorText={errorMap.state}
              name="state"
              onChange={formik.handleChange}
              placeholder="Enter region"
              required={flags.regionDropdown}
              value={formik.values.state}
              data-qa-contact-state-province
            />
          )}
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          updateFor={[formik.values.city, errorMap.city, classes]}
        >
          <TextField
            label="City"
            name="city"
            errorText={errorMap.city}
            onChange={formik.handleChange}
            value={formik.values.city}
            data-qa-contact-city
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField
            label="Postal Code"
            name="zip"
            errorText={errorMap.zip}
            onChange={formik.handleChange}
            value={formik.values.zip}
            data-qa-contact-post-code
          />
        </Grid>
        <Grid
          item
          xs={12}
          updateFor={[formik.values.phone, errorMap.phone, classes]}
        >
          <TextField
            label="Phone"
            type="tel"
            name="phone"
            errorText={errorMap.phone}
            onChange={formik.handleChange}
            value={formik.values.phone}
            data-qa-contact-phone
          />
        </Grid>
        <Grid
          item
          xs={12}
          updateFor={[formik.values.tax_id, errorMap.tax_id, classes]}
        >
          <TextField
            label="Tax ID"
            name="tax_id"
            errorText={errorMap.tax_id}
            value={formik.values.tax_id}
            onChange={formik.handleChange}
            data-qa-contact-tax-id
          />
        </Grid>
      </Grid>
      <ActionsPanel className={classes.actions}>
        <Button
          buttonType="secondary"
          onClick={onClose}
          data-qa-reset-contact-info
        >
          Cancel
        </Button>
        <Button
          buttonType="primary"
          type="submit"
          loading={isLoading}
          data-qa-save-contact-info
        >
          Save Changes
        </Button>
      </ActionsPanel>
    </form>
  );
};

const useStyles = makeStyles()({
  mainFormContainer: {
    maxWidth: 860,
    '& .MuiGrid-item:not(:first-child) label': {
      marginTop: 0,
    },
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: 0,
    '& button': {
      marginBottom: 0,
    },
  },
});

export default UpdateContactInformationForm;

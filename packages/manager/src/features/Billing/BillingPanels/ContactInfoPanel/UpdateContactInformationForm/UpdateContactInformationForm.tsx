import countryData, { Region } from 'country-region-data';
import { pathOr } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles } from 'tss-react/mui';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from '@mui/material/Unstable_Grid2';
import { Notice } from 'src/components/Notice/Notice';
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

const UpdateContactInformationForm = ({ focusEmail, onClose }: Props) => {
  const { data: account } = useAccount();
  const { error, isLoading, mutateAsync } = useMutateAccount();
  const { data: notifications, refetch } = useNotificationsQuery();
  const { classes } = useStyles();
  const flags = useFlags();
  const emailRef = React.useRef<HTMLInputElement>();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      address_1: account?.address_1,
      address_2: account?.address_2,
      city: account?.city,
      company: account?.company,
      country: account?.country,
      email: account?.email,
      first_name: account?.first_name,
      last_name: account?.last_name,
      phone: account?.phone,
      state: account?.state,
      tax_id: account?.tax_id,
      zip: account?.zip,
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
      label: country.countryName,
      value: country.countryShortCode,
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
        label: 'Virgin Islands, U.S.',
        value: region.shortCode,
      };
    }

    return {
      label: region.name,
      value: region.shortCode,
    };
  });

  let filteredRegionResults;

  if (formik.values.country === 'US') {
    filteredRegionResults = regionResults.filter(
      (region) => !excludedUSRegions.includes(region.label)
    );

    filteredRegionResults.push({
      label: 'United States Minor Outlying Islands',
      value: 'UM',
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
        className={classes.mainFormContainer}
        columnSpacing={2}
        container
        spacing={0}
        data-qa-update-contact
      >
        {generalError && (
          <Grid xs={12}>
            <Notice error text={generalError} />
          </Grid>
        )}
        <Grid xs={12}>
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
        <Grid xs={12} sm={6}>
          <TextField
            label="First Name"
            errorText={errorMap.first_name}
            name="first_name"
            onChange={formik.handleChange}
            value={formik.values.first_name}
            data-qa-contact-first-name
          />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField
            label="Last Name"
            name="last_name"
            errorText={errorMap.last_name}
            onChange={formik.handleChange}
            value={formik.values.last_name}
            data-qa-contact-last-name
          />
        </Grid>
        <Grid xs={12}>
          <TextField
            label="Company Name"
            name="company"
            errorText={errorMap.company}
            onChange={formik.handleChange}
            value={formik.values.company}
            data-qa-company
          />
        </Grid>
        <Grid xs={12}>
          <TextField
            label="Address"
            name="address_1"
            errorText={errorMap.address_1}
            onChange={formik.handleChange}
            value={formik.values.address_1}
            data-qa-contact-address-1
          />
        </Grid>
        <Grid xs={12}>
          <TextField
            label="Address 2"
            name="address_2"
            errorText={errorMap.address_2}
            onChange={formik.handleChange}
            value={formik.values.address_2}
            data-qa-contact-address-2
          />
        </Grid>

        <Grid xs={12} sm={6}>
          <EnhancedSelect
            label="Country"
            errorText={errorMap.country}
            isClearable={false}
            onChange={(item) => formik.setFieldValue('country', item.value)}
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
        <Grid xs={12} sm={6}>
          {flags.regionDropdown &&
          (formik.values.country === 'US' || formik.values.country == 'CA') ? (
            <EnhancedSelect
              label={`${formik.values.country === 'US' ? 'State' : 'Province'}`}
              errorText={errorMap.state}
              isClearable={false}
              onChange={(item) => formik.setFieldValue('state', item.value)}
              options={filteredRegionResults}
              placeholder={
                formik.values.country === 'US' ? 'state' : 'province'
              }
              required={flags.regionDropdown}
              value={
                filteredRegionResults.find(
                  ({ value }) => value === formik.values.state
                ) ?? null
              }
              textFieldProps={{
                dataAttrs: {
                  'data-qa-contact-state-province': true,
                },
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
        <Grid xs={12} sm={6}>
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
        <Grid xs={12}>
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
        <Grid xs={12}>
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
  actions: {
    '& button': {
      marginBottom: 0,
    },
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  mainFormContainer: {
    '& .MuiGrid-item:not(:first-of-type) label': {
      marginTop: 0,
    },
    maxWidth: 860,
  },
});

export default UpdateContactInformationForm;

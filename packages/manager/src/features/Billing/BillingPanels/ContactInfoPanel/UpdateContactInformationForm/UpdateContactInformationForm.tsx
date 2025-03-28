import {
  accountQueries,
  useAccount,
  useMutateAccount,
  useMutateAccountAgreements,
  useNotificationsQuery,
  useProfile,
} from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Checkbox,
  Notice,
  TextField,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useQueryClient } from '@tanstack/react-query';
import { allCountries } from 'country-region-data';
import { useFormik } from 'formik';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { reportException } from 'src/exceptionReporting';
import {
  getRestrictedResourceText,
  useIsTaxIdEnabled,
} from 'src/features/Account/utils';
import {
  TAX_ID_AGREEMENT_TEXT,
  TAX_ID_HELPER_TEXT,
} from 'src/features/Billing/constants';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { getErrorMap } from 'src/utilities/errorUtils';

import type { Account } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
interface Props {
  focusEmail: boolean;
  onClose: () => void;
}

const excludedUSRegions = ['Micronesia', 'Marshall Islands', 'Palau'];

const UpdateContactInformationForm = ({ focusEmail, onClose }: Props) => {
  const { data: account } = useAccount();
  const { error, isPending, mutateAsync } = useMutateAccount();
  const queryClient = useQueryClient();
  const { data: notifications, refetch } = useNotificationsQuery();
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();
  const { classes } = useStyles();
  const emailRef = React.useRef<HTMLInputElement>();
  const { data: profile } = useProfile();
  const [billingAgreementChecked, setBillingAgreementChecked] = React.useState(
    false
  );
  const { isTaxIdEnabled } = useIsTaxIdEnabled();
  const isChildUser = profile?.user_type === 'child';
  const isParentUser = profile?.user_type === 'parent';
  const isReadOnly =
    useRestrictedGlobalGrantCheck({
      globalGrantType: 'account_access',
      permittedGrantLevel: 'read_write',
    }) || isChildUser;

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
      const clonedValues = { ...values };

      if (isParentUser) {
        // This is a disabled field that we want to omit from payload.
        delete clonedValues.company;
      }

      await mutateAsync(clonedValues, {
        onSuccess: (account) => {
          queryClient.setQueryData<Account | undefined>(
            accountQueries.account.queryKey,
            (prevAccount) => {
              if (!prevAccount) {
                return account;
              }

              if (
                isTaxIdEnabled &&
                account.tax_id &&
                account.country !== 'US' &&
                prevAccount?.tax_id !== account.tax_id
              ) {
                enqueueSnackbar(
                  "You edited the Tax Identification Number. It's being verified. You'll get an email with the verification result.",
                  {
                    hideIconVariant: false,
                    variant: 'info',
                  }
                );
                queryClient.invalidateQueries({
                  queryKey: accountQueries.notifications.queryKey,
                });
              }

              return account;
            }
          );
        },
      });

      if (billingAgreementChecked) {
        try {
          await updateAccountAgreements({ billing_agreement: true });
        } catch (error) {
          let customErrorMessage =
            'Expected to sign billing agreement, but the request resulted in an error';
          const apiErrorMessage = error?.[0]?.reason;

          if (apiErrorMessage) {
            customErrorMessage += `: ${apiErrorMessage}`;
          }

          reportException(error, {
            message: customErrorMessage,
          });
        }
      }

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

  /**
   * `country-region-data` mapping:
   *
   * COUNTRY
   * - country[0] is the readable name of the country (e.g. "United States")
   * - country[1] is the ISO 3166-1 alpha-2 code of the country (e.g. "US")
   * - country[2] is an array of regions for the country
   *
   * REGION
   * - region[0] is the readable name of the region (e.g. "Alabama")
   * - region[1] is the ISO 3166-2 code of the region (e.g. "AL")
   */
  const countryResults: SelectOption<string>[] = (allCountries || []).map(
    (country) => {
      return {
        label: country[0],
        value: country[1],
      };
    }
  );

  const currentCountryResult = (allCountries || []).filter((country) =>
    formik.values.country
      ? country[1] === formik.values.country
      : country[1] === account?.country
  );

  const countryRegions = currentCountryResult?.[0]?.[2] ?? [];

  const regionResults = countryRegions.map((region) => {
    if (formik.values.country === 'US' && region[0] === 'Virgin Islands') {
      return {
        label: 'Virgin Islands, U.S.',
        value: region[1],
      };
    }

    return {
      label: region[0],
      value: region[1],
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

  const handleCountryChange = (item: SelectOption<string>) => {
    formik.setFieldValue('country', item.value);
    formik.setFieldValue('tax_id', '');
  };

  const nonUSCountry = isTaxIdEnabled && formik.values.country !== 'US';

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid
        className={classes.mainFormContainer}
        columnSpacing={2}
        container
        data-qa-update-contact
        spacing={0}
      >
        {isReadOnly && (
          <Grid size={12}>
            <Notice
              text={getRestrictedResourceText({
                isChildUser,
                resourceType: 'Account',
              })}
              variant="error"
            />
          </Grid>
        )}
        {generalError && (
          <Grid size={12}>
            <Notice text={generalError} variant="error" />
          </Grid>
        )}
        <Grid size={12}>
          <TextField
            data-qa-contact-email
            disabled={isReadOnly}
            errorText={errorMap.email}
            helperTextPosition="top"
            inputRef={emailRef}
            label="Email"
            name="email"
            onChange={formik.handleChange}
            required
            trimmed
            type="email"
            value={formik.values.email}
          />
        </Grid>
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          <TextField
            data-qa-contact-first-name
            disabled={isReadOnly}
            errorText={errorMap.first_name}
            label="First Name"
            name="first_name"
            onChange={formik.handleChange}
            value={formik.values.first_name}
          />
        </Grid>
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          <TextField
            data-qa-contact-last-name
            disabled={isReadOnly}
            errorText={errorMap.last_name}
            label="Last Name"
            name="last_name"
            onChange={formik.handleChange}
            value={formik.values.last_name}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            data-qa-company
            disabled={isReadOnly || isParentUser}
            errorText={errorMap.company}
            label="Company Name"
            name="company"
            onChange={formik.handleChange}
            value={formik.values.company}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            data-qa-contact-address-1
            disabled={isReadOnly}
            errorText={errorMap.address_1}
            label="Address"
            name="address_1"
            onChange={formik.handleChange}
            value={formik.values.address_1}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            data-qa-contact-address-2
            disabled={isReadOnly}
            errorText={errorMap.address_2}
            label="Address 2"
            name="address_2"
            onChange={formik.handleChange}
            value={formik.values.address_2}
          />
        </Grid>

        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          <Autocomplete
            textFieldProps={{
              dataAttrs: {
                'data-qa-contact-country': true,
              },
              required: true,
            }}
            value={countryResults.find(
              ({ value }) => value === formik.values.country
            )}
            disableClearable
            disabled={isReadOnly}
            errorText={errorMap.country}
            label="Country"
            onChange={(_event, value) => handleCountryChange(value)}
            options={countryResults}
            placeholder="Select a Country"
          />
        </Grid>
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          {formik.values.country === 'US' || formik.values.country == 'CA' ? (
            <Autocomplete
              onChange={(_event, value) =>
                formik.setFieldValue('state', value?.value)
              }
              placeholder={
                formik.values.country === 'US'
                  ? 'Enter state'
                  : 'Enter province'
              }
              textFieldProps={{
                dataAttrs: {
                  'data-qa-contact-state-province': true,
                },
                required: true,
              }}
              value={
                filteredRegionResults.find(
                  ({ value }) => value === formik.values.state
                ) ?? undefined
              }
              disableClearable
              disabled={isReadOnly}
              errorText={errorMap.state}
              label={`${formik.values.country === 'US' ? 'State' : 'Province'}`}
              options={filteredRegionResults}
            />
          ) : (
            <TextField
              data-qa-contact-state-province
              disabled={isReadOnly}
              errorText={errorMap.state}
              label="State / Province"
              name="state"
              onChange={formik.handleChange}
              placeholder="Enter region"
              required
              value={formik.values.state}
            />
          )}
        </Grid>
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          <TextField
            data-qa-contact-city
            disabled={isReadOnly}
            errorText={errorMap.city}
            label="City"
            name="city"
            onChange={formik.handleChange}
            value={formik.values.city}
          />
        </Grid>
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          <TextField
            data-qa-contact-post-code
            disabled={isReadOnly}
            errorText={errorMap.zip}
            label="Postal Code"
            name="zip"
            onChange={formik.handleChange}
            value={formik.values.zip}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            data-qa-contact-phone
            disabled={isReadOnly}
            errorText={errorMap.phone}
            label="Phone"
            name="phone"
            onChange={formik.handleChange}
            type="tel"
            value={formik.values.phone}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            data-qa-contact-tax-id
            disabled={isReadOnly}
            errorText={errorMap.tax_id}
            helperText={nonUSCountry && TAX_ID_HELPER_TEXT}
            label="Tax ID"
            name="tax_id"
            onChange={formik.handleChange}
            value={formik.values.tax_id}
          />
        </Grid>
        {nonUSCountry && (
          <Grid
            sx={{
              alignItems: 'flex-start',
              display: 'flex',
              marginTop: (theme) => theme.tokens.spacing.S16,
            }}
            size={12}
          >
            <Checkbox
              onChange={() =>
                setBillingAgreementChecked(!billingAgreementChecked)
              }
              sx={(theme) => ({
                marginRight: theme.tokens.spacing.S8,
                padding: 0,
              })}
              checked={billingAgreementChecked}
              data-testid="tax-id-checkbox"
              id="taxIdAgreementCheckbox"
            />
            <Typography component="label" htmlFor="taxIdAgreementCheckbox">
              {TAX_ID_AGREEMENT_TEXT}{' '}
              <Link to="https://www.akamai.com/legal/privacy-statement">
                Akamai Privacy Statement.
              </Link>
            </Typography>
          </Grid>
        )}
      </Grid>
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'save-contact-info',
          disabled: isReadOnly || (nonUSCountry && !billingAgreementChecked),
          label: 'Save Changes',
          loading: isPending,
          type: 'submit',
        }}
        secondaryButtonProps={{
          'data-testid': 'reset-contact-info',
          label: 'Cancel',
          onClick: onClose,
        }}
        className={classes.actions}
      />
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

import { yupResolver } from '@hookform/resolvers/yup';
import { useCreatePartnerReferralMutation, useProfile } from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Box,
  Checkbox,
  Drawer,
  FormControl,
  FormHelperText,
  InputAdornment,
  LinkButton,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import { createPartnerReferralSchema } from '@linode/validation';
import { createFilterOptions, Grid, Theme } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { makeStyles } from 'tss-react/mui';

import { Flag } from 'src/components/Flag';
import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { countries } from 'src/features/Profile/AuthenticationSettings/PhoneVerification/countries';
import { getCountryName } from 'src/features/Profile/AuthenticationSettings/PhoneVerification/helpers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type {
  Country,
  MarketplacePartnerReferralPayload,
} from '@linode/api-v4';

const useStyles = makeStyles()((theme: Theme) => ({
  hideAddEmailButton: {
    marginTop: 0,
    '& [class*="addIP"]': {
      display: 'none',
    },
  },
  addEmailButton: {
    marginTop: 0,
    '& [class*="addIP"]': {
      paddingBottom: 0,
    },
    '& [class*="addIP"]:hover': {
      color: theme.tokens.alias.Content.Text.Link.Hover,
    },
  },
}));

interface ContactSalesDrawerProps {
  onClose: () => void;
  open: boolean;
  partnerName: string;
  productName: string;
}

interface CountryItem {
  code: string;
  dialingCode: string;
  label: string;
  name: string;
}

export const ContactSalesDrawer = (props: ContactSalesDrawerProps) => {
  const { classes } = useStyles();
  const { onClose, open, partnerName, productName } = props;

  const { data: profile } = useProfile();

  const countryList: CountryItem[] = React.useMemo(
    () =>
      countries
        .filter((c) => c.dialingCode !== '')
        .map((country) => ({
          label: getCountryName(country.name),
          ...country,
        })),
    [countries]
  );

  const defaultCountry = countryList.find((c) => c.code === 'US');

  const [selectedCountry, setSelectedCountry] = React.useState<
    CountryItem | undefined
  >(defaultCountry);

  const [selectedPhoneCountry, setSelectedPhoneCountry] = React.useState<
    CountryItem | undefined
  >(defaultCountry);

  const [showConsentDetails, setShowConsentDetails] = React.useState(false);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    trigger,
    watch,
  } = useForm<MarketplacePartnerReferralPayload>({
    defaultValues: {
      country_code: 'US',
      email: profile?.email || '',
      additional_emails: [''],
      name: profile?.username || '',
      partner_name: partnerName,
      product_name: productName,
      phone: '',
      phone_country_code: '+1',
      comments: '',
      tc_consent_given: false,
    },
    mode: 'onBlur',
    resolver: yupResolver(createPartnerReferralSchema),
  });

  const tc_consent = watch('tc_consent_given');

  const dialingCodeFilterOptions = createFilterOptions({
    ignoreCase: true,
    ignoreAccents: true,
    stringify: (option: CountryItem) =>
      `${option.name} ${option.dialingCode} ${option.code}`,
  });

  const { mutateAsync: createPartnerReferral } =
    useCreatePartnerReferralMutation();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createPartnerReferral(values);
      enqueueSnackbar(
        'Your request has been received by Akamai. After we forward it to the partner, you will receive a confirmation email.',
        { variant: 'success' }
      );
      reset();
      onClose();
    } catch (error) {
      const errorMessage = error
        ? getAPIErrorOrDefault(error)?.[0].reason
        : "Oops! Something went wrong and we couldn't send your contacts. Please try again in a moment, or refresh the page.";
      enqueueSnackbar(errorMessage, { variant: 'error' });
      onClose();
    }
  });

  return (
    <Drawer
      data-testid="contact-sales-drawer"
      onClose={() => {
        reset();
        onClose();
      }}
      open={open}
      title={`Contact ${partnerName} sales`}
    >
      <form onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Typography>
            Fill the form and our partner's sales team will reach out to you
          </Typography>
          <FormControl>
            <FormLabel htmlFor="name">Name</FormLabel>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Typography id="name">{field.value}</Typography>
              )}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Typography id="email">{field.value}</Typography>
              )}
            />
          </FormControl>
          <Controller
            control={control}
            name="additional_emails"
            render={({ field }) => {
              const emailErrors = errors.additional_emails;
              return (
                <MultipleIPInput
                  buttonText="Add email address"
                  className={
                    field.value?.length === 2
                      ? classes.hideAddEmailButton
                      : classes.addEmailButton
                  }
                  disabled={isSubmitting}
                  ips={
                    field.value?.map((email, index) => ({
                      address: email,
                      error: emailErrors?.[index]?.message,
                    })) || []
                  }
                  onBlur={field.onBlur}
                  onChange={(value) => {
                    if (value.length === 0) {
                      field.onChange(['']);
                    } else {
                      field.onChange(value.map((email) => email.address));
                    }
                  }}
                  title="Additional email addresses"
                  tooltip="You can add two additional emails"
                />
              );
            }}
          />
          <FormControl>
            <FormLabel htmlFor="country_code">
              Country <Typography component="span">(required)</Typography>
            </FormLabel>
            <Controller
              control={control}
              name="country_code"
              render={({ field }) => (
                <Autocomplete
                  disableClearable
                  disabled={isSubmitting}
                  errorText={errors.country_code?.message}
                  getOptionLabel={(option) => getCountryName(option.name)}
                  id="country_code"
                  isOptionEqualToValue={(option, value) =>
                    option.label === value.label
                  }
                  keepSearchEnabledOnMobile
                  label="Country"
                  onBlur={field.onBlur}
                  onChange={(_event, country) => {
                    setSelectedCountry(country);
                    field.onChange(country.code);
                  }}
                  options={countryList}
                  placeholder="Select a region from the list"
                  renderOption={({ key, ...props }, option) => (
                    <li {...props}>
                      <Stack
                        alignItems="center"
                        direction="row"
                        gap={1}
                        sx={{ width: '100%' }}
                      >
                        <Flag country={option.code.toLowerCase() as Country} />
                        <Box>{getCountryName(option.name)}</Box>
                      </Stack>
                    </li>
                  )}
                  textFieldProps={{
                    dataAttrs: {
                      'data-qa-contact-country': true,
                    },
                    hideLabel: true,
                    inputRef: field.ref,
                    InputProps: {
                      startAdornment: selectedCountry && (
                        <InputAdornment position="start">
                          <Flag
                            country={
                              selectedCountry?.code.toLowerCase() as Country
                            }
                            sx={{ maxHeight: '16px', maxWidth: '22px' }}
                          />
                        </InputAdornment>
                      ),
                    },
                    required: true,
                  }}
                  value={selectedCountry}
                />
              )}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="phone-number">
              Phone Number <Typography component="span">(required)</Typography>
            </FormLabel>
            <Stack direction="row" sx={{ marginTop: 0, width: '100%' }}>
              <Controller
                control={control}
                name="phone_country_code"
                render={({ field }) => (
                  <Autocomplete
                    disableClearable
                    filterOptions={dialingCodeFilterOptions}
                    getOptionLabel={(option) => option.dialingCode}
                    id="phone_country_code"
                    isOptionEqualToValue={(option, value) =>
                      option.label === value.label
                    }
                    label="Phone Number"
                    onBlur={field.onBlur}
                    onChange={(_, country) => {
                      setSelectedPhoneCountry(country);
                      field.onChange(country?.dialingCode ?? null);
                      trigger('phone');
                    }}
                    options={countryList}
                    placeholder=""
                    renderOption={({ key, ...props }, option) => (
                      <li {...props}>
                        <Stack
                          alignItems="center"
                          direction="row"
                          gap={1}
                          sx={{ width: '100%' }}
                        >
                          <Flag
                            country={option.code.toLowerCase() as Country}
                          />
                          <Box>{getCountryName(option.name)}</Box>
                          <Box>{option.dialingCode}</Box>
                        </Stack>
                      </li>
                    )}
                    slotProps={{
                      paper: {
                        sx: {
                          overflow: 'hidden',
                          // Set the options width to cover the entire textfield when the drawer is at or above its designed width
                          width: {
                            sm: '401px',
                            xs: '366px',
                          },
                          // When the drawer width is less than 445px, expand to drawer width (minus padding offset) on mobile
                          '@media (max-width: 445px)': {
                            width: 'calc(100vw - 79px)',
                          },
                        },
                      },
                    }}
                    textFieldProps={{
                      error: !!errors.phone_country_code,
                      hideLabel: true,
                      inputRef: field.ref,
                      InputProps: {
                        startAdornment: field.value && selectedPhoneCountry && (
                          <InputAdornment position="start">
                            <Flag
                              country={
                                selectedPhoneCountry?.code.toLowerCase() as Country
                              }
                              sx={{ maxHeight: '16px', maxWidth: '22px' }}
                            />
                          </InputAdornment>
                        ),
                      },
                      sx: { minWidth: '110px' },
                    }}
                    value={selectedPhoneCountry}
                  />
                )}
              />
              <Controller
                control={control}
                name="phone"
                render={({ field }) => {
                  return (
                    <Box sx={{ flexGrow: 1 }}>
                      <TextField
                        error={!!errors?.phone}
                        fullWidth
                        hideLabel
                        id="phone_number"
                        inputRef={field.ref}
                        label="Phone Number"
                        name="phone_number"
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        sx={{
                          '& .MuiInputBase-root:not(.Mui-focused):not(:hover):not(.Mui-error)':
                            {
                              borderLeft: 0,
                            },
                        }}
                        type="tel"
                        value={field.value}
                      />
                    </Box>
                  );
                }}
              />
            </Stack>
            {(errors?.phone || errors?.phone_country_code) && (
              <FormHelperText error sx={{ marginLeft: 0 }}>
                {errors?.phone_country_code?.message || errors?.phone?.message}
              </FormHelperText>
            )}
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="company-name">Your Company's Name</FormLabel>
            <Controller
              control={control}
              name="company_name"
              render={({ field }) => (
                <TextField
                  {...field}
                  containerProps={{
                    sx: {
                      '& .MuiFormHelperText-root': {
                        marginLeft: 0,
                      },
                    },
                  }}
                  disabled={isSubmitting}
                  errorText={errors.company_name?.message}
                  hideLabel
                  id="company-name"
                  label="Your Company's Name"
                  placeholder="Enter a company name"
                />
              )}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="account-executive-email">
              Akamai account executive email
            </FormLabel>
            <Controller
              control={control}
              name="account_executive_email"
              render={({ field }) => (
                <TextField
                  {...field}
                  containerProps={{
                    sx: {
                      '& .MuiFormHelperText-root': {
                        marginLeft: 0,
                      },
                    },
                  }}
                  disabled={isSubmitting}
                  errorText={errors.account_executive_email?.message}
                  hideLabel
                  id="account-executive-email"
                  label="Akamai account executive email"
                  placeholder="Enter Akamai executive email"
                  type="email"
                />
              )}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="additional-comments">
              Additional Comments
            </FormLabel>
            <Controller
              control={control}
              name="comments"
              render={({ field }) => (
                <TextField
                  {...field}
                  containerProps={{
                    sx: {
                      '& .MuiFormHelperText-root': {
                        marginLeft: 0,
                      },
                    },
                  }}
                  disabled={isSubmitting}
                  errorText={errors.comments?.message}
                  hideLabel
                  id="additional-comments"
                  label="Additional Comments"
                  multiline
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  placeholder="Feel free to share any additional thoughts or questions here"
                  value={field.value}
                />
              )}
            />
          </FormControl>
          <Controller
            control={control}
            name="tc_consent_given"
            render={({ field }) => (
              <Grid
                size={12}
                sx={{
                  alignItems: 'flex-start',
                  display: 'flex',
                  marginTop: (theme) => theme.spacing(2),
                }}
              >
                <Checkbox
                  checked={field.value}
                  disabled={isSubmitting}
                  id="tc_consent-checkbox"
                  onChange={field.onChange}
                  sx={(theme) => ({
                    marginRight: theme.spacing(1),
                    padding: 0,
                  })}
                />
                <Box>
                  <Typography
                    sx={(theme) => ({
                      marginBottom: theme.spacing(1),
                    })}
                  >
                    I consent to Akamai sharing the above information with the
                    third-party provider.
                  </Typography>

                  {showConsentDetails && (
                    <Typography
                      sx={(theme) => ({
                        marginBottom: theme.spacing(1),
                      })}
                    >
                      Akamai is seeking your consent to share the information
                      you provide above with the third-party provider you
                      selected (see the{' '}
                      <Link to="https://www.akamai.com/legal/compliance/privacy-trust-center">
                        Akamai Privacy Trust Center
                      </Link>{' '}
                      for more information about when Akamai may share your
                      information). After being shared with the third-party
                      provider you have selected, it will be subject to deletion
                      by Akamai. The third-party provider you have selected will
                      process the information as described in accordance with
                      their privacy policy.
                    </Typography>
                  )}
                  <LinkButton
                    onClick={() => setShowConsentDetails(!showConsentDetails)}
                    sx={(theme) => ({
                      '&:hover': {
                        color: theme.tokens.alias.Content.Text.Link.Hover,
                        textDecoration: 'none',
                      },
                      '&:hover:not(:disabled)': {
                        textDecoration: 'none',
                      },
                    })}
                  >
                    {showConsentDetails ? 'Hide details' : 'Show details'}
                  </LinkButton>
                </Box>
              </Grid>
            )}
          />
        </Stack>
        <ActionsPanel
          primaryButtonProps={{
            label: 'Submit',
            disabled: isSubmitting || !tc_consent,
            type: 'submit',
            tooltipText:
              'Please agree to share your information with the partner to proceed.',
            alwaysShowTooltip: !tc_consent,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
            buttonType: 'outlined',
            sx: {
              width: '70px',
            },
          }}
        />
      </form>
    </Drawer>
  );
};

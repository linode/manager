import * as React from 'react';
import InputAdornment from 'src/components/core/InputAdornment';
import Notice from 'src/components/Notice';
import classNames from 'classnames';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import TextField from 'src/components/TextField';
import Typography from 'src/components/core/Typography';
import FormHelperText from 'src/components/core/FormHelperText';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { APIError } from '@linode/api-v4/lib/types';
import { LinkButton } from 'src/components/LinkButton';
import { countries } from './countries';
import { queryKey, updateProfileData, useProfile } from 'src/queries/profile';
import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';
import {
  SendPhoneVerificationCodePayload,
  VerifyVerificationCodePayload,
} from '@linode/api-v4/lib/profile/types';
import {
  useSendPhoneVerificationCodeMutation,
  useVerifyPhoneVerificationCodeMutation,
} from 'src/queries/profile';
import { getCountryFlag, getCountryName, getFormattedNumber } from './helpers';
import { useStyles } from './styles';
import { queryClient } from 'src/queries/base';

export const PhoneVerification = () => {
  const classes = useStyles();

  const { data: profile } = useProfile();
  const { enqueueSnackbar } = useSnackbar();

  const hasVerifiedPhoneNumber = Boolean(profile?.phone_number);

  const [view, setView] = React.useState(hasVerifiedPhoneNumber);
  const [isPhoneInputFocused, setIsPhoneInputFocused] = React.useState(false);

  const {
    data,
    mutateAsync: sendPhoneVerificationCode,
    reset: resetSendCodeMutation,
    error: sendPhoneVerificationCodeError,
  } = useSendPhoneVerificationCodeMutation();

  const {
    mutateAsync: resendPhoneVerificationCode,
    isLoading: isResending,
  } = useSendPhoneVerificationCodeMutation();

  const {
    mutateAsync: sendVerificationCode,
    error: verifyError,
  } = useVerifyPhoneVerificationCodeMutation();

  const isCodeSent = data !== undefined;

  const onSubmitPhoneNumber = async (
    values: SendPhoneVerificationCodePayload
  ) => {
    return await sendPhoneVerificationCode(values);
  };

  const onSubmitVerificationCode = async (
    values: VerifyVerificationCodePayload
  ) => {
    await sendVerificationCode(values);

    const countryOfNewPhoneNumber = countries.find(
      (country) => country.code === sendCodeForm.values.iso_code
    );

    if (countryOfNewPhoneNumber) {
      // if Cloud Manager is aware of the country the user used, we can assume how the API will parse and return the number
      updateProfileData({
        phone_number: `${countryOfNewPhoneNumber.dialingCode}${sendCodeForm.values.phone_number}`,
      });
    } else {
      // Cloud Manager does not know about the country, so lets refetch the user's phone number so we know it's displaying correctly
      queryClient.invalidateQueries(queryKey);
    }

    // reset the form, but forcefully go to view mode because we can't
    // expect the state to be updated immediately
    reset(true);

    enqueueSnackbar('Successfully verified phone number', {
      variant: 'success',
    });
  };

  const sendCodeForm = useFormik<SendPhoneVerificationCodePayload>({
    initialValues: {
      phone_number: '',
      iso_code: 'US',
    },
    onSubmit: onSubmitPhoneNumber,
  });

  const verifyCodeForm = useFormik<VerifyVerificationCodePayload>({
    initialValues: {
      otp_code: '',
    },
    onSubmit: onSubmitVerificationCode,
  });

  const reset = (returnToViewMode: boolean = false) => {
    // if the user has a verified phone number, it's always safe to return
    // the state back to view mode.
    if (hasVerifiedPhoneNumber || returnToViewMode) {
      setView(true);
    }

    // clear mutation data because we use that to know if a code has been sent or not
    resetSendCodeMutation();

    // reset formik forms
    sendCodeForm.resetForm();
    verifyCodeForm.resetForm();
  };

  const onEdit = () => {
    setView(false);
  };

  const onEnterDifferentPhoneNumber = () => {
    resetSendCodeMutation();
    sendCodeForm.resetForm();
  };

  const onResendVerificationCode = () => {
    resendPhoneVerificationCode(sendCodeForm.values)
      .then(() => {
        enqueueSnackbar('Successfully resent verification code', {
          variant: 'success',
        });
      })
      .catch((e: APIError[]) =>
        enqueueSnackbar(e?.[0].reason ?? 'Unable to resend verification code')
      );
  };

  const customStyles = {
    menu: () => ({
      width: '500px',
      marginLeft: '-1px !important',
      marginTop: '0px !important',
    }),
    singleValue: (provided: React.CSSProperties) => ({
      ...provided,
      textAlign: 'center',
      fontSize: '20px',
    }),
  };

  const selectedCountry = countries.find(
    (country) => country.code === sendCodeForm.values.iso_code
  );

  const isFormSubmitting = isCodeSent
    ? verifyCodeForm.isSubmitting
    : sendCodeForm.isSubmitting;

  return (
    <>
      {!view && isCodeSent ? (
        <Box className={classes.codeSentMessage}>
          <Typography>
            SMS verification code was sent to{' '}
            {parsePhoneNumber(
              sendCodeForm.values.phone_number,
              sendCodeForm.values.iso_code as CountryCode
            )?.formatInternational()}
          </Typography>
          <Typography>
            <LinkButton onClick={onEnterDifferentPhoneNumber}>
              Enter a different phone number
            </LinkButton>
          </Typography>
        </Box>
      ) : null}
      <Box>
        <form
          onSubmit={
            isCodeSent ? verifyCodeForm.handleSubmit : sendCodeForm.handleSubmit
          }
        >
          {view ? (
            <>
              <Typography variant="h3" className={classes.phoneNumberTitle}>
                Phone Number
              </Typography>
              <Box display="flex" alignItems="center" style={{ gap: 16 }}>
                <Typography>
                  {profile?.phone_number
                    ? getFormattedNumber(profile.phone_number)
                    : 'No Phone Number'}
                </Typography>
                <LinkButton onClick={onEdit}>Edit</LinkButton>
              </Box>
            </>
          ) : isCodeSent ? (
            <TextField
              label="Verification Code"
              id="otp_code"
              name="otp_code"
              type="text"
              onChange={verifyCodeForm.handleChange}
              value={verifyCodeForm.values.otp_code}
              errorText={verifyError?.[0].reason}
              helperText={
                <LinkButton
                  onClick={onResendVerificationCode}
                  isDisabled={isResending}
                  isLoading={isResending}
                >
                  Resend verification code
                </LinkButton>
              }
            />
          ) : (
            <>
              <Typography className={classes.label}>Phone Number</Typography>
              <Box
                display="flex"
                className={classNames(classes.inputContainer, {
                  [classes.focused]: isPhoneInputFocused,
                })}
              >
                <Select
                  onFocus={() => setIsPhoneInputFocused(true)}
                  onBlur={() => setIsPhoneInputFocused(false)}
                  styles={customStyles}
                  menuPlacement="bottom"
                  className={classes.select}
                  id="iso_code"
                  name="iso_code"
                  type="text"
                  isClearable={false}
                  value={{
                    value: sendCodeForm.values.iso_code,
                    label: getCountryFlag(sendCodeForm.values.iso_code),
                  }}
                  isOptionSelected={(option: Item) =>
                    sendCodeForm.values.iso_code === option.value
                  }
                  onChange={(item: Item) =>
                    sendCodeForm.setFieldValue('iso_code', item.value)
                  }
                  options={countries.map((counrty) => ({
                    label: `${getCountryName(counrty.name)} ${
                      counrty.dialingCode
                    } ${getCountryFlag(counrty.code)}`,
                    value: counrty.code,
                  }))}
                  noMarginTop
                  hideLabel
                />
                <TextField
                  onFocus={() => setIsPhoneInputFocused(true)}
                  onBlur={() => setIsPhoneInputFocused(false)}
                  className={classes.phoneNumberInput}
                  InputProps={{
                    startAdornment: selectedCountry ? (
                      <InputAdornment position="end">
                        {selectedCountry.dialingCode}
                      </InputAdornment>
                    ) : undefined,
                  }}
                  label="Phone Number"
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  onChange={sendCodeForm.handleChange}
                  value={sendCodeForm.values.phone_number}
                  hideLabel
                />
              </Box>
              {sendPhoneVerificationCodeError ? (
                <FormHelperText className={classes.errorText} role="alert">
                  {sendPhoneVerificationCodeError[0].reason}
                </FormHelperText>
              ) : null}
              <Notice spacingTop={16} spacingBottom={0} spacingLeft={1} warning>
                <Typography style={{ maxWidth: 600, fontSize: '0.875rem' }}>
                  <b>
                    By clicking Send Verification Code you are opting in to
                    receive SMS messages reguarding account verification. SMS
                    messaging will only be used for account verification.{' '}
                    <a href="https://www.linode.com/docs/guides/linode-manager-security-controls/">
                      Learn more about security options.
                    </a>
                  </b>
                </Typography>
              </Notice>
            </>
          )}
          <Box
            display="flex"
            justifyContent="flex-end"
            className={classes.buttonContainer}
          >
            {isCodeSent || (hasVerifiedPhoneNumber && !view) ? (
              <Button
                buttonType="secondary"
                disabled={isFormSubmitting}
                onClick={() => reset()}
              >
                Cancel
              </Button>
            ) : null}
            <Button
              loading={isFormSubmitting}
              disabled={view}
              buttonType="primary"
              type="submit"
            >
              {isCodeSent ? 'Verify Phone Number' : 'Send Verification Code'}
            </Button>
          </Box>
        </form>
      </Box>
    </>
  );
};

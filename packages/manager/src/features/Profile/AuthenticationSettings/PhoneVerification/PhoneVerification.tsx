import * as React from 'react';
import Box from 'src/components/core/Box';
import Button from 'src/components/Button';
import InputAdornment from 'src/components/core/InputAdornment';
import TextField from 'src/components/TextField';
import Typography from 'src/components/core/Typography';
import { APIError } from '@linode/api-v4/lib/types';
import { countries } from './countries';
import { CountryCode, parsePhoneNumber } from 'libphonenumber-js';
import { getCountryFlag, getCountryName, getFormattedNumber } from './helpers';
import { LinkButton } from 'src/components/LinkButton';
import { useFormik } from 'formik';
import { useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import {
  StyledButtonContainer,
  StyledCodeSentMessageBox,
  StyledFormHelperText,
  StyledInputContainer,
  StyledLabel,
  StyledPhoneNumberInput,
  StyledPhoneNumberTitle,
  StyledSelect,
} from './PhoneVerification.styles';
import {
  queryKey,
  updateProfileData,
  useProfile,
  useSendPhoneVerificationCodeMutation,
  useVerifyPhoneVerificationCodeMutation,
} from 'src/queries/profile';
import type { Item } from 'src/components/EnhancedSelect/Select';
import type {
  SendPhoneVerificationCodePayload,
  VerifyVerificationCodePayload,
} from '@linode/api-v4/lib/profile/types';

export const PhoneVerification = () => {
  const { data: profile } = useProfile();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const hasVerifiedPhoneNumber = Boolean(profile?.verified_phone_number);
  const [isViewMode, setIsViewMode] = React.useState(hasVerifiedPhoneNumber);
  const [isPhoneInputFocused, setIsPhoneInputFocused] = React.useState(false);

  React.useEffect(() => {
    // If the user opts-out, hasVerifiedPhoneNumber will change, therefore
    // we need this component to update its state.
    if (isViewMode !== hasVerifiedPhoneNumber) {
      setIsViewMode(hasVerifiedPhoneNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVerifiedPhoneNumber, profile]);

  const {
    data,
    mutateAsync: sendPhoneVerificationCode,
    reset: resetSendCodeMutation,
    error: sendPhoneVerificationCodeError,
    mutateAsync: resendPhoneVerificationCode,
    isLoading: isResending,
  } = useSendPhoneVerificationCodeMutation();
  const {
    mutateAsync: sendVerificationCode,
    reset: resetCodeMutation,
    error: verifyError,
  } = useVerifyPhoneVerificationCodeMutation();
  const isCodeSent = data !== undefined;
  const onSubmitPhoneNumber = async (
    values: SendPhoneVerificationCodePayload
  ) => {
    resetCodeMutation();
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
      updateProfileData(
        {
          verified_phone_number: `${countryOfNewPhoneNumber.dialingCode}${sendCodeForm.values.phone_number}`,
        },
        queryClient
      );
    } else {
      // Cloud Manager does not know about the country, so lets refetch the user's phone number so we know it's displaying correctly
      queryClient.invalidateQueries(queryKey);
    }

    // reset form states
    reset();

    // force the flow back into view mode
    setIsViewMode(true);

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

  const reset = () => {
    // clear mutation data because we use that to know if a code has been sent or not
    resetSendCodeMutation();

    // reset formik forms
    sendCodeForm.resetForm();
    verifyCodeForm.resetForm();
  };

  const onCancel = () => {
    // if the user has a verified phone number, it's safe to return to view mode
    if (hasVerifiedPhoneNumber) {
      setIsViewMode(true);
    }
    reset();
  };

  const onEdit = () => {
    setIsViewMode(false);
  };

  const onEnterDifferentPhoneNumber = () => {
    reset();
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
    singleValue: (provided: React.CSSProperties) =>
      ({
        ...provided,
        textAlign: 'center',
        fontSize: '20px',
      } as const),
  };
  const selectedCountry = countries.find(
    (country) => country.code === sendCodeForm.values.iso_code
  );
  const isFormSubmitting = isCodeSent
    ? verifyCodeForm.isSubmitting
    : sendCodeForm.isSubmitting;

  return (
    <>
      {!isViewMode && isCodeSent ? (
        <StyledCodeSentMessageBox>
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
        </StyledCodeSentMessageBox>
      ) : null}
      <Box>
        <form
          onSubmit={
            isCodeSent ? verifyCodeForm.handleSubmit : sendCodeForm.handleSubmit
          }
        >
          {isViewMode ? (
            <>
              <StyledPhoneNumberTitle variant="h3">
                Phone Number
              </StyledPhoneNumberTitle>
              <Box display="flex" alignItems="center" style={{ gap: 10 }}>
                <Typography>
                  {profile?.verified_phone_number
                    ? getFormattedNumber(profile.verified_phone_number)
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
              <StyledLabel>Phone Number</StyledLabel>
              <StyledInputContainer
                display="flex"
                isPhoneInputFocused={isPhoneInputFocused}
              >
                <StyledSelect
                  label="ISO Code"
                  onFocus={() => setIsPhoneInputFocused(true)}
                  onBlur={() => setIsPhoneInputFocused(false)}
                  styles={customStyles}
                  menuPlacement="bottom"
                  id="iso_code"
                  name="iso_code"
                  isClearable={false}
                  value={{
                    value: sendCodeForm.values.iso_code,
                    label: getCountryFlag(sendCodeForm.values.iso_code),
                  }}
                  isOptionSelected={(option) =>
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
                <StyledPhoneNumberInput
                  onFocus={() => setIsPhoneInputFocused(true)}
                  onBlur={() => setIsPhoneInputFocused(false)}
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
              </StyledInputContainer>
              {sendPhoneVerificationCodeError ? (
                <StyledFormHelperText role="alert">
                  {sendPhoneVerificationCodeError[0].reason}
                </StyledFormHelperText>
              ) : null}
            </>
          )}
          <StyledButtonContainer display="flex" justifyContent="flex-end">
            {isCodeSent || (hasVerifiedPhoneNumber && !isViewMode) ? (
              <Button
                buttonType="secondary"
                disabled={isFormSubmitting}
                onClick={onCancel}
              >
                Cancel
              </Button>
            ) : null}
            <Button
              loading={isFormSubmitting}
              disabled={isViewMode}
              buttonType="primary"
              type="submit"
            >
              {isCodeSent ? 'Verify Phone Number' : 'Send Verification Code'}
            </Button>
          </StyledButtonContainer>
        </form>
      </Box>
    </>
  );
};

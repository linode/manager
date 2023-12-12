import { APIError } from '@linode/api-v4/lib/types';
import { useFormik } from 'formik';
import { CountryCode, parsePhoneNumber } from 'libphonenumber-js';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { LinkButton } from 'src/components/LinkButton';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { InputAdornment } from 'src/components/InputAdornment';
import {
  profileQueries,
  updateProfileData,
  useProfile,
  useSendPhoneVerificationCodeMutation,
  useVerifyPhoneVerificationCodeMutation,
} from 'src/queries/profile';

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
import { countries } from './countries';
import { getCountryFlag, getCountryName, getFormattedNumber } from './helpers';

import type {
  SendPhoneVerificationCodePayload,
  VerifyVerificationCodePayload,
} from '@linode/api-v4/lib/profile/types';
import type { Item } from 'src/components/EnhancedSelect/Select';

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
    error: sendPhoneVerificationCodeError,
    isLoading: isResending,
    mutateAsync: resendPhoneVerificationCode,
    mutateAsync: sendPhoneVerificationCode,
    reset: resetSendCodeMutation,
  } = useSendPhoneVerificationCodeMutation();
  const {
    error: verifyError,
    mutateAsync: sendVerificationCode,
    reset: resetCodeMutation,
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
      queryClient.invalidateQueries(profileQueries.profile.queryKey);
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
      iso_code: 'US',
      phone_number: '',
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
      marginLeft: '-1px !important',
      marginTop: '0px !important',
      width: '500px',
    }),
    singleValue: (provided: React.CSSProperties) =>
      ({
        ...provided,
        fontSize: '20px',
        textAlign: 'center',
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
              <Box alignItems="center" display="flex" style={{ gap: 10 }}>
                <Typography>
                  {profile?.verified_phone_number
                    ? getFormattedNumber(profile.verified_phone_number)
                    : 'No Phone Number'}
                </Typography>
                <LinkButton
                  style={{
                    bottom: -0.5,
                    fontSize: '0.85rem',
                    position: 'relative',
                  }}
                  onClick={onEdit}
                >
                  Edit
                </LinkButton>
              </Box>
            </>
          ) : isCodeSent ? (
            <TextField
              helperText={
                <LinkButton
                  isDisabled={isResending}
                  isLoading={isResending}
                  onClick={onResendVerificationCode}
                >
                  Resend verification code
                </LinkButton>
              }
              errorText={verifyError?.[0].reason}
              id="otp_code"
              label="Verification Code"
              name="otp_code"
              onChange={verifyCodeForm.handleChange}
              type="text"
              value={verifyCodeForm.values.otp_code}
            />
          ) : (
            <>
              <StyledLabel>Phone Number</StyledLabel>
              <StyledInputContainer
                display="flex"
                isPhoneInputFocused={isPhoneInputFocused}
              >
                <StyledSelect
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
                  value={{
                    label: getCountryFlag(sendCodeForm.values.iso_code),
                    value: sendCodeForm.values.iso_code,
                  }}
                  hideLabel
                  id="iso_code"
                  isClearable={false}
                  label="ISO Code"
                  menuPlacement="bottom"
                  name="iso_code"
                  noMarginTop
                  onBlur={() => setIsPhoneInputFocused(false)}
                  onFocus={() => setIsPhoneInputFocused(true)}
                  styles={customStyles}
                />
                <StyledPhoneNumberInput
                  InputProps={{
                    startAdornment: selectedCountry ? (
                      <InputAdornment position="end">
                        {selectedCountry.dialingCode}
                      </InputAdornment>
                    ) : undefined,
                  }}
                  hideLabel
                  id="phone_number"
                  label="Phone Number"
                  name="phone_number"
                  onBlur={() => setIsPhoneInputFocused(false)}
                  onChange={sendCodeForm.handleChange}
                  onFocus={() => setIsPhoneInputFocused(true)}
                  type="tel"
                  value={sendCodeForm.values.phone_number}
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
              buttonType="primary"
              disabled={isViewMode}
              loading={isFormSubmitting}
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

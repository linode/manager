import {
  profileQueries,
  updateProfileData,
  useProfile,
  useSendPhoneVerificationCodeMutation,
  useVerifyPhoneVerificationCodeMutation,
} from '@linode/queries';
import { Box, Button, InputAdornment, TextField, Typography } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { parsePhoneNumber } from 'libphonenumber-js';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { LinkButton } from 'src/components/LinkButton';
import { MaskableText } from 'src/components/MaskableText/MaskableText';

import { countries } from './countries';
import { getCountryFlag, getCountryName, getFormattedNumber } from './helpers';
import {
  StyledButtonContainer,
  StyledCodeSentMessageBox,
  StyledFormHelperText,
  StyledInputContainer,
  StyledISOCodeSelect,
  StyledLabel,
  StyledPhoneNumberInput,
  StyledPhoneNumberTitle,
} from './PhoneVerification.styles';

import type {
  SendPhoneVerificationCodePayload,
  VerifyVerificationCodePayload,
} from '@linode/api-v4/lib/profile/types';
import type { APIError } from '@linode/api-v4/lib/types';
import type { CountryCode } from 'libphonenumber-js';

export interface SelectPhoneVerificationOption {
  label: string;
  value: string;
}

export const PhoneVerification = ({
  phoneNumberRef,
}: {
  phoneNumberRef: React.RefObject<HTMLInputElement>;
}) => {
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
    isPending: isResending,
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
      queryClient.invalidateQueries({
        queryKey: profileQueries.profile().queryKey,
      });
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
                  <MaskableText
                    isToggleable
                    text={
                      profile?.verified_phone_number
                        ? getFormattedNumber(profile.verified_phone_number)
                        : 'No Phone Number'
                    }
                  />
                </Typography>
                <LinkButton
                  onClick={onEdit}
                  style={{
                    bottom: -0.5,
                    fontSize: '0.85rem',
                    position: 'relative',
                  }}
                >
                  Edit
                </LinkButton>
              </Box>
            </>
          ) : isCodeSent ? (
            <TextField
              errorText={verifyError?.[0].reason}
              helperText={
                <LinkButton
                  isDisabled={isResending}
                  isLoading={isResending}
                  onClick={onResendVerificationCode}
                >
                  Resend verification code
                </LinkButton>
              }
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
                <StyledISOCodeSelect
                  autoHighlight
                  disableClearable
                  disablePortal={true}
                  id="iso_code"
                  isOptionEqualToValue={(option, value) =>
                    option.label === value.label
                  }
                  label="ISO Code"
                  onBlur={() => setIsPhoneInputFocused(false)}
                  onChange={(_, item: SelectPhoneVerificationOption) => {
                    sendCodeForm.setFieldValue('iso_code', item.value);
                  }}
                  onFocus={() => setIsPhoneInputFocused(true)}
                  options={countries.map((country) => ({
                    label: `${getCountryName(country.name)} ${
                      country.dialingCode
                    } ${getCountryFlag(country.code)}`,
                    value: country.code,
                  }))}
                  placeholder=""
                  slotProps={{
                    paper: {
                      sx: (theme) => ({
                        border: `1px solid ${theme.tokens.color.Ultramarine[80]}`,
                        maxHeight: '285px',
                        overflow: 'hidden',
                        textWrap: 'nowrap',
                        width: 'fit-content',
                      }),
                    },
                  }}
                  textFieldProps={{
                    hideLabel: true,
                    style: {
                      border: 'none',
                      minWidth: '72px',
                    },
                  }}
                  value={{
                    label: getCountryFlag(sendCodeForm.values.iso_code),
                  }}
                />
                <StyledPhoneNumberInput
                  hideLabel
                  id="phone_number"
                  InputProps={{
                    startAdornment: selectedCountry ? (
                      <InputAdornment position="end">
                        {selectedCountry.dialingCode}
                      </InputAdornment>
                    ) : undefined,
                  }}
                  inputRef={phoneNumberRef}
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

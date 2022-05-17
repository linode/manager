import * as React from 'react';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import TextField from 'src/components/TextField';
import Typography from 'src/components/core/Typography';
import { useFormik } from 'formik';
import { SendPhoneVerificationCodePayload } from '@linode/api-v4/lib/profile/types';
import { useStyles } from 'src/features/Billing/BillingPanels/PaymentInfoPanel/AddPaymentMethodDrawer/AddPaymentMethodDrawer';
import {
  updateProfileData,
  useProfile,
  useSendPhoneVerificationCodeMutation,
  useVerifyPhoneVerificationCodeMutation,
} from 'src/queries/profile';
import { useSnackbar } from 'notistack';
import { APIError } from '@linode/api-v4/lib/types';
import { LinkButton } from 'src/components/LinkButton';

type VerificationFormValues = { otp_code: string };

export const PhoneVerification = () => {
  const { data: profile } = useProfile();
  const [view, setView] = React.useState(Boolean(profile?.phone_number));
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const {
    data,
    mutateAsync: sendPhoneVerificationCode,
    reset: resetSendCodeMutation,
  } = useSendPhoneVerificationCodeMutation();

  const {
    mutateAsync: resendPhoneVerificationCode,
    isLoading: isResending,
  } = useSendPhoneVerificationCodeMutation();

  const {
    mutateAsync: sendVerificationCode,
  } = useVerifyPhoneVerificationCodeMutation();

  const isCodeSent = data !== undefined;

  const onSubmitPhoneNumber = async (
    values: SendPhoneVerificationCodePayload
  ) => {
    return await sendPhoneVerificationCode(values);
  };

  const onSubmitVerificationCode = async (values: VerificationFormValues) => {
    await sendVerificationCode({ otp_code: Number(values.otp_code) });

    // Update the Profile store
    updateProfileData({ phone_number: sendCodeForm.values.phone_number });

    // put component back into view mode
    setView(true);

    // clear mutation data because we use that to know if a code has been sent or not
    resetSendCodeMutation();

    // reset formik forms
    sendCodeForm.resetForm();
    verifyCodeForm.resetForm();

    // show success to user via a toast
    enqueueSnackbar('Successfully verified phone number', {
      variant: 'success',
    });
  };

  const sendCodeForm = useFormik<SendPhoneVerificationCodePayload>({
    initialValues: {
      phone_number: '',
    },
    onSubmit: onSubmitPhoneNumber,
  });

  const verifyCodeForm = useFormik<VerificationFormValues>({
    initialValues: {
      otp_code: '',
    },
    onSubmit: onSubmitVerificationCode,
  });

  const onEdit = () => {
    setView(false);
  };

  const onEnterDifferentPhoneNumber = () => {
    resetSendCodeMutation();
    sendCodeForm.resetForm();
  };

  const onResendVerificationCode = () => {
    resendPhoneVerificationCode({
      phone_number: sendCodeForm.values.phone_number,
    })
      .then(() => {
        enqueueSnackbar('Successfully resent verification code', {
          variant: 'success',
        });
      })
      .catch((e: APIError[]) =>
        enqueueSnackbar(e?.[0].reason ?? 'Unable to resend verification code')
      );
  };

  return (
    <>
      {!view && isCodeSent ? (
        <>
          <Typography style={{ marginTop: 12 }}>
            SMS verification code was sent to {sendCodeForm.values.phone_number}
          </Typography>
          <Typography>
            <button
              className={classes.link}
              onClick={onEnterDifferentPhoneNumber}
            >
              Enter a different phone number
            </button>
          </Typography>
        </>
      ) : null}
      <Box style={{ marginTop: 8 }}>
        <form
          onSubmit={
            isCodeSent ? verifyCodeForm.handleSubmit : sendCodeForm.handleSubmit
          }
        >
          {view ? (
            <>
              <Typography
                variant="h3"
                style={{ fontSize: '.875rem', marginTop: 12 }}
              >
                Phone Number
              </Typography>
              <Box display="flex" alignItems="center">
                <Typography>{profile?.phone_number}</Typography>
                <Button buttonType="secondary" onClick={onEdit} compact>
                  Edit
                </Button>
              </Box>
            </>
          ) : (
            <TextField
              label={isCodeSent ? 'Verification Code' : 'Phone Number'}
              id={isCodeSent ? 'otp_code' : 'phone_number'}
              name={isCodeSent ? 'otp_code' : 'phone_number'}
              type={isCodeSent ? 'text' : 'tel'}
              onChange={
                isCodeSent
                  ? verifyCodeForm.handleChange
                  : sendCodeForm.handleChange
              }
              value={
                isCodeSent
                  ? verifyCodeForm.values.otp_code
                  : sendCodeForm.values.phone_number
              }
              helperText={
                isCodeSent ? (
                  <LinkButton
                    onClick={onResendVerificationCode}
                    isDisabled={isResending}
                    isLoading={isResending}
                  >
                    Resend verification code
                  </LinkButton>
                ) : undefined
              }
            />
          )}
          <Box display="flex" justifyContent="flex-end">
            <Button
              loading={
                isCodeSent
                  ? verifyCodeForm.isSubmitting
                  : sendCodeForm.isSubmitting
              }
              disabled={view}
              buttonType="primary"
              type="submit"
            >
              {isCodeSent ? 'Verify Phone Number' : 'Add Phone Number'}
            </Button>
          </Box>
        </form>
      </Box>
    </>
  );
};

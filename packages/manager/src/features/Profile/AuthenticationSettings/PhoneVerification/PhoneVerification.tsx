import * as React from 'react';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import TextField from 'src/components/TextField';
import Typography from 'src/components/core/Typography';
import { useFormik } from 'formik';
import { makeStyles, Theme } from 'src/components/core/styles';
import { SendPhoneVerificationCodePayload } from '@linode/api-v4/lib/profile/types';
import { useSnackbar } from 'notistack';
import { APIError } from '@linode/api-v4/lib/types';
import { LinkButton } from 'src/components/LinkButton';
import {
  updateProfileData,
  useProfile,
  useSendPhoneVerificationCodeMutation,
  useVerifyPhoneVerificationCodeMutation,
} from 'src/queries/profile';

const useStyles = makeStyles((theme: Theme) => ({
  codeSentMessage: {
    marginTop: theme.spacing(1.5),
  },
  phoneNumberTitle: {
    fontSize: '.875rem',
    marginTop: theme.spacing(1.5),
  },
  buttonContainer: {
    gap: theme.spacing(),
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(2),
    },
  },
}));

type VerificationFormValues = { otp_code: string };

export const PhoneVerification = () => {
  const classes = useStyles();

  const { data: profile } = useProfile();
  const { enqueueSnackbar } = useSnackbar();

  const [view, setView] = React.useState(Boolean(profile?.phone_number));

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

    // Manually update the React Query store so state updates
    updateProfileData({ phone_number: sendCodeForm.values.phone_number });

    reset();

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

  const reset = () => {
    // put component back into view mode
    setView(true);

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

  const isFormSubmitting = isCodeSent
    ? verifyCodeForm.isSubmitting
    : sendCodeForm.isSubmitting;

  return (
    <>
      {!view && isCodeSent ? (
        <Box className={classes.codeSentMessage}>
          <Typography>
            SMS verification code was sent to {sendCodeForm.values.phone_number}
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
              <Box display="flex" alignItems="center">
                <Typography>{profile?.phone_number}</Typography>
                <Button buttonType="secondary" onClick={onEdit} compact>
                  Edit
                </Button>
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
            <TextField
              label="Phone Number"
              id="phone_number"
              name="phone_number"
              type="tel"
              onChange={sendCodeForm.handleChange}
              value={sendCodeForm.values.phone_number}
            />
          )}
          <Box
            display="flex"
            justifyContent="flex-end"
            className={classes.buttonContainer}
          >
            {!view ? (
              <Button
                buttonType="secondary"
                disabled={isFormSubmitting}
                onClick={reset}
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
              {isCodeSent ? 'Verify Phone Number' : 'Add Phone Number'}
            </Button>
          </Box>
        </form>
      </Box>
    </>
  );
};

import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
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
import { countries } from './countries';
import {
  updateProfileData,
  useProfile,
  useSendPhoneVerificationCodeMutation,
  useVerifyPhoneVerificationCodeMutation,
} from 'src/queries/profile';
import InputAdornment from 'src/components/core/InputAdornment';
import Notice from 'src/components/Notice';
import classNames from 'classnames';

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
  phoneNumberInput: {
    minWidth: '300px',
    border: 'unset',
    '&:focus': {
      boxShadow: 'unset',
      borderColor: 'unset',
    },
    '&.Mui-focused': {
      boxShadow: 'none',
      borderColor: 'unset',
    },
  },
  select: {
    width: '70px',
    height: '34px',
    border: 'unset',
    '&:focus': {
      boxShadow: 'unset',
      borderColor: 'unset',
    },
    '&.Mui-focused': {
      boxShadow: 'none',
      borderColor: 'unset',
    },
    '& .MuiInputBase-input .react-select__indicators svg': {
      color: `${theme.palette.primary.main} !important`,
      opacity: '1 !important',
    },
  },
  label: {
    marginTop: theme.spacing(2),
    color: theme.name === 'lightTheme' ? '#555' : '#c9cacb',
    padding: 0,
    fontSize: '.875rem',
    fontWeight: 400,
    lineHeight: '1',
    marginBottom: '8px',
    fontFamily: 'LatoWebBold',
  },
  inputContainer: {
    border: theme.name === 'lightTheme' ? '1px solid #ccc' : '1px solid #222',
    width: 'fit-content',
    transition: 'border-color 225ms ease-in-out',
  },
  focused:
    theme.name === 'lightTheme'
      ? {
          boxShadow: '0 0 2px 1px #e1edfa',
          borderColor: '#3683dc',
        }
      : {
          boxShadow: '0 0 2px 1px #222',
          borderColor: '#3683dc',
        },
}));

type VerificationFormValues = { otp_code: string };

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

  const verifyCodeForm = useFormik<VerificationFormValues>({
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

  const getFlag = (code: string) => {
    if (!code) {
      return code;
    }

    const OFFSET = 127397;

    if (code == 'XI') {
      return '🇬🇧';
    }
    if (code == 'LO') {
      return '🇮🇹';
    }
    if (code == 'LL') {
      return '🇨🇭';
    }
    if (code == 'DX') {
      return '🇧🇶';
    }
    return (
      String.fromCodePoint(code.charCodeAt(0) + OFFSET) +
      String.fromCodePoint(code.charCodeAt(1) + OFFSET)
    );
  };

  const getCountryName = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
      .join(' ');

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
                    label: getFlag(sendCodeForm.values.iso_code),
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
                    } ${getFlag(counrty.code)}`,
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
              <Notice spacingTop={16} spacingBottom={0} spacingLeft={1} warning>
                <Typography style={{ maxWidth: 600, fontSize: '0.875rem' }}>
                  <b>
                    By clicking Send Verification Code you are opting in to
                    recieve SMS messages reguarding account verification. SMS
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
              {isCodeSent ? 'Verify Phone Number' : 'Add Phone Number'}
            </Button>
          </Box>
        </form>
      </Box>
    </>
  );
};

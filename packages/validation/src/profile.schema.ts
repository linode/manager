import { isPossiblePhoneNumber } from 'libphonenumber-js';
import { array, boolean, number, object, string } from 'yup';

export const createPersonalAccessTokenSchema = object({
  scopes: string(),
  expiry: string(),
  label: string()
    .min(1, 'Label must be between 1 and 100 characters.')
    .max(100, 'Label must be between 1 and 100 characters.'),
});

export const createSSHKeySchema = object({
  label: string()
    .required('Label is required.')
    .min(1, 'Label must be between 1 and 64 characters.')
    .max(64, 'Label must be between 1 and 64 characters.')
    .trim(),
  ssh_key: string(),
});

export const updateSSHKeySchema = object({
  label: string()
    .required('Label is required.')
    .min(1, 'Label must be between 1 and 64 characters.')
    .max(64, 'Label must be between 1 and 64 characters.')
    .trim(),
});

export const updateProfileSchema = object({
  email: string().email(),
  timezone: string(),
  email_notifications: boolean(),
  authorized_keys: array().of(string()),
  restricted: boolean(),
  two_factor_auth: boolean(),
  lish_auth_method: string().oneOf(['password_keys', 'keys_only', 'disabled']),
  authentication_type: string().oneOf(['password', 'github']),
});

export const SendCodeToPhoneNumberSchema = object({
  iso_code: string().required(),
  phone_number: string().test(
    'is-phone-number',
    'Not a valid phone number',
    (phone_number: string | undefined, context) => {
      const { iso_code } = context.parent;
      if (!phone_number) {
        return false;
      }
      return isPossiblePhoneNumber(phone_number, iso_code);
    },
  ),
});

export const VerifyPhoneNumberCodeSchema = object({
  otp_code: string()
    .required('Verification Code is required.')
    .test(
      'digits only',
      'The verification code must only contain digits.',
      (value) => {
        if (!value) {
          return true;
        }

        return /^\d+$/.test(value);
      },
    ),
});

export const SecurityQuestionsSchema = object({
  security_questions: array()
    .of(
      object({
        question_id: number().required('You must pick a question.'),
        response: string()
          .min(3, 'Answers must be at least 3 characters.')
          .max(17, 'Answers must be at most 17 characters.')
          .required('You must provide an answer to each security question.'),
      }).required(),
    )
    .length(3, 'You must answer all 3 security questions.')
    .required(),
});

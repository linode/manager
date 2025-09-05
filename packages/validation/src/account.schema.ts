import { array, boolean, mixed, number, object, string } from 'yup';

import { emailSchema } from './profile.schema';

export const updateAccountSchema = object({
  email: string().max(128, 'Email must be 128 characters or less.'),
  address_1: string().max(64, 'Address must be 64 characters or less.'),
  city: string().max(24, 'City must be 24 characters or less.'),
  company: string().max(128, 'Company must be 128 characters or less.'),
  country: string()
    .min(2, 'Country code must be two letters.')
    .max(2, 'Country code must be two letters.'),
  first_name: string().max(50, 'First name must be 50 characters or less.'),
  last_name: string().max(50, 'Last name must be 50 characters or less.'),
  address_2: string().max(64, 'Address must be 64 characters or less.'),
  phone: string().max(32, 'Phone number must be 32 characters or less.'),
  state: string().max(24, 'State must be 24 characters or less.'),
  tax_id: string().max(100, 'Tax ID must be 100 characters or less.'),
  zip: string().max(16, 'Zip code must be 16 characters or less.'),
});

export const createOAuthClientSchema = object({
  label: string()
    .required('Label is required.')
    .min(1, 'Label must be between 1 and 512 characters.')
    .max(512, 'Label must be between 1 and 512 characters.'),
  redirect_uri: string().required('Redirect URI is required.'),
});

export const updateOAuthClientSchema = object({
  label: string()
    .min(1, 'Label must be between 1 and 512 characters.')
    .max(512, 'Label must be between 1 and 512 characters.'),
  redirect_uri: string(),
});

export const PaymentSchema = object({
  usd: string().required('USD payment amount is required.'),
});

export const CreditCardSchema = object({
  card_number: string()
    .required('Credit card number is required.')
    .min(13, 'Credit card number must be between 13 and 23 characters.')
    .max(23, 'Credit card number must be between 13 and 23 characters.'),
  expiry_year: number()
    .test('length', 'Expiration year must be 2 or 4 digits.', (value) =>
      [2, 4].includes(String(value).length),
    )
    .required('Expiration year is required.')
    .typeError('Expiration year must be a number.')
    .min(new Date().getFullYear(), 'Expiration year must not be in the past.')
    .max(new Date().getFullYear() + 20, 'Expiry too far in the future.'),
  expiry_month: number()
    .required('Expiration month is required.')
    .typeError('Expiration month must be a number.')
    .min(1, 'Expiration month must be a number from 1 to 12.')
    .max(12, 'Expiration month must be a number from 1 to 12.'),
  cvv: string()
    .required('Security code is required.')
    .min(3, 'Security code must be between 3 and 4 characters.')
    .max(4, 'Security code must be between 3 and 4 characters.'),
});

export const PaymentMethodSchema = object({
  type: mixed().oneOf(
    ['credit_card', 'payment_method_nonce'],
    'Type must be credit_card or payment_method_nonce.',
  ),
  data: object().when('type', {
    is: 'credit_card',
    then: () => CreditCardSchema,
    otherwise: () =>
      object({
        nonce: string().required('Payment nonce is required.'),
      }),
  }),
  is_default: boolean().required(
    'You must indicate if this should be your default method of payment.',
  ),
});

export const userNameErrors = {
  lengthError: 'Username must be between 3 and 32 characters.',
  consecutiveError:
    'Username must not include two dashes or underscores in a row.',
  charsError:
    'Username may only contain letters, numbers, dashes, and underscores and must begin and end with letters or numbers.',
  spacesError: 'Username may not contain spaces or tabs.',
  nonAsciiError: 'Username must only use ASCII characters.',
};

const usernameSchema = string()
  .required('Username is required.')
  .min(3, userNameErrors.lengthError)
  .max(32, userNameErrors.lengthError)
  .test('ascii-only', userNameErrors.nonAsciiError, (value) => {
    if (!value) return false;
    // Check if all characters are ASCII (character codes 0-127)
    return [...value].every((char) => char.charCodeAt(0) <= 127);
  })
  .test('no-whitespace', userNameErrors.spacesError, (value) => {
    if (!value) return true; // Allow empty values (required check handles this)
    return !/[ \t]/.test(value);
  })
  .test(
    'no-consecutive-separators',
    userNameErrors.consecutiveError,
    (value) => {
      if (!value) return true; // Allow empty values (required check handles this)
      return !value.includes('__') && !value.includes('--');
    },
  )
  .test('valid-characters', userNameErrors.charsError, (value) => {
    if (!value) return false;

    // Check first and last characters (letters or numbers)
    const firstChar = value[0];
    const lastChar = value[value.length - 1];
    const isAlphaNum = /[a-zA-Z0-9]/;

    if (!isAlphaNum.test(firstChar) || !isAlphaNum.test(lastChar)) {
      return false;
    }

    // Check all characters are valid (letters, numbers, dashes, underscores)
    return /^[a-zA-Z0-9_-]+$/.test(value);
  });

export const CreateUserSchema = object({
  username: usernameSchema,
  email: emailSchema,
  restricted: boolean().required(
    'You must indicate if this user should have restricted access.',
  ),
});

export const UpdateUserNameSchema = object({
  username: usernameSchema,
});

export const UpdateUserEmailSchema = object({
  email: emailSchema,
});

export const UpdateUserSchema = object({
  username: string()
    .min(3, userNameErrors.lengthError)
    .max(32, userNameErrors.lengthError),
  email: string().email('Must be a valid email address.'),
  restricted: boolean(),
});

const GrantSchema = object({
  id: number().required('ID is required.'),
  permissions: string()
    .oneOf(
      ['read_only', 'read_write'],
      'Permissions must be null, read_only, or read_write.',
    )
    .nullable('Permissions must be null, read_only, or read_write.'),
});

export const UpdateGrantSchema = object({
  global: object(),
  linode: array().of(GrantSchema),
  domain: array().of(GrantSchema),
  nodebalancer: array().of(GrantSchema),
  image: array().of(GrantSchema),
  longview: array().of(GrantSchema),
  stackscript: array().of(GrantSchema),
  volume: array().of(GrantSchema),
});

export const UpdateAccountSettingsSchema = object({
  network_helper: boolean(),
  backups_enabled: boolean(),
  managed: boolean(),
  longview_subscription: string().nullable(),
  object_storage: string(),
  interfaces_for_new_linodes: string(),
});

export const PromoCodeSchema = object({
  promo_code: string()
    .required('Promo code is required.')
    .min(1, 'Promo code must be between 1 and 32 characters.')
    .max(32, 'Promo code must be between 1 and 32 characters.'),
});

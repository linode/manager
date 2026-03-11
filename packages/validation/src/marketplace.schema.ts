import { isValidPhoneNumber } from 'libphonenumber-js';
import { array, boolean, object, string } from 'yup';

const AKAMAI_EMAIL_VALIDATION_REGEX = new RegExp(
  /^[A-Za-z0-9._%+-]+@akamai\.com$/,
);

export const createPartnerReferralSchema = object({
  partner_name: string().required('Partner Name is required.'),
  product_name: string().required('Product Name is required.'),
  name: string().required('Name is required.'),
  email: string()
    .email('Please enter a valid email')
    .required('Email is required.'),
  additional_emails: array()
    .optional()
    .of(string().defined().trim().email('Please enter a valid email address.'))
    .max(2, 'You can only provide up to 2 emails'),
  country_code: string().required('Please select your region'),
  phone_country_code: string().required('Please select your dialing code.'),
  phone: string()
    .required('Phone number is required.')
    .when('phone_country_code', () =>
      string().test(
        'is-phone-number',
        'Please enter a valid phone number.',
        (phone_number, context) => {
          const { phone_country_code } = context.parent;

          if (!phone_number || !phone_country_code) {
            return false;
          }

          return isValidPhoneNumber(`${phone_country_code}${phone_number}`);
        },
      ),
    ),
  company_name: string().optional(),
  account_executive_email: string()
    .optional()
    .trim()
    .matches(AKAMAI_EMAIL_VALIDATION_REGEX, {
      excludeEmptyString: true,
      message: 'Must be an Akamai email address.',
    }),
  comments: string()
    .optional()
    .trim()
    .max(500, 'Comments must contain 500 characters or less.'),
  tc_consent_given: boolean().required(
    'Terms and conditions consent is required.',
  ),
});

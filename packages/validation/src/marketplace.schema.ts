import { array, boolean, number, object, string } from 'yup';

const AKAMAI_EMAIL_VALIDATION_REGEX = new RegExp(
  /^[A-Za-z0-9._%+-]+@akamai\.com$/,
);

export const createPartnerReferralSchema = object({
  partner_id: number().required('Partner ID is required.'),
  name: string().required('Name is required.'),
  email: string()
    .email('Must be a valid email address.')
    .required('Email is required.'),
  additional_emails: array()
    .of(string().email('Must be a valid email address'))
    .max(2, 'You can only provide up to 2 emails')
    .optional(),
  country_code: string().required('Country code is required.'),
  phone_country_code: string().required('Phone country code is required.'),
  phone: string().required('Phone number is required.'),
  company_name: string().nullable(),
  account_executive_email: string()
    .email('Must be a valid email address.')
    .matches(AKAMAI_EMAIL_VALIDATION_REGEX, `Must be an akamai email address.`)
    .optional(),
  comments: string()
    .nullable()
    .trim()
    .max(500, 'Comments must contain 500 characters or less.'),
  tc_consent_given: boolean()
    .oneOf([true], 'You must agree to the terms and conditions.')
    .required('Terms and conditions consent is required.'),
});

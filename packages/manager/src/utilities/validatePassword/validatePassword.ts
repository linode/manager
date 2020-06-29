import { string } from 'yup';
import { MINIMUM_PASSWORD_STRENGTH } from 'src/constants';
import { PasswordValidationType } from 'src/featureFlags';
import { object } from 'yup';
import * as zxcvbn from 'zxcvbn';

const passwordLengthAndCharacterSchema = string()
  .min(6, 'Password must be between 6 and 128 characters.')
  .max(128, 'Password must be between 6 and 128 characters.')
  .matches(
    /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[!"#$%&'()*+,-.\/:;<=>?@\[\]^_`{|}~\\]))|((?=.*[A-Z])(?=.*[!"#$%&'()*+,-.\/:;<=>?@\[\]^_`{|}~\\]))|((?=.*[0-9])(?=.*[!"#$%&'()*+,-.\/:;<=>?@\[\]^_`{|}~\\])))/,
    'Password must contain at least 2 of the following classes: uppercase letters, lowercase letters, numbers, and punctuation.'
  );

export const validatePassword = (
  validationType: PasswordValidationType,
  password: string
) => {
  // This method does not evaluate whether a password is required.
  if (!password) {
    return null;
  }
  switch (validationType) {
    case 'none':
      return null;
    case 'length':
      try {
        passwordLengthAndCharacterSchema.validateSync(password);
        return null;
      } catch (e) {
        return e.message;
      }
    case 'complexity':
      return zxcvbn(password).score >= MINIMUM_PASSWORD_STRENGTH
        ? null
        : 'Password does not meet complexity requirements.';
  }
};

/**
 * Extends a Yup schema with a password validation
 * check. This check is dynamic based on the type
 * of validation requested, normally controlled through
 * a feature flag.
 *
 * Remove this method once API password validation
 * is stable.
 *
 * @todo: Update Yup and typings to avoid the any
 * dodge here
 */
export const extendValidationSchema = (
  validationType: PasswordValidationType,
  schema: any
) => {
  return (schema as any).concat(
    object({
      root_pass: string()
        .required('Password is required.')
        .test({
          name: 'root-password-strength',
          // eslint-disable-next-line object-shorthand
          test: function(value) {
            const passwordError = validatePassword(
              validationType ?? 'none',
              value
            );
            return Boolean(validatePassword)
              ? this.createError({
                  message: passwordError,
                  path: 'root_pass'
                })
              : true;
          }
        })
    })
  );
};

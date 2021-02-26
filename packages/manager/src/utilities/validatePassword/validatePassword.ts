import { string } from 'yup';
import { MINIMUM_PASSWORD_STRENGTH } from 'src/constants';
import { object } from 'yup';
import * as zxcvbn from 'zxcvbn';

export const validatePassword = (password: string) => {
  // This method does not evaluate whether a password is required.
  if (!password) {
    return null;
  }

  return zxcvbn(password).score >= MINIMUM_PASSWORD_STRENGTH
    ? null
    : 'Password does not meet complexity requirements.';
};

/**
 * Extends a Yup schema with a password validation
 * check.
 *
 * @todo: Update Yup and typings to avoid the any
 * dodge here
 */
export const extendValidationSchema = (schema: any) => {
  return (schema as any).concat(
    object({
      root_pass: string()
        .required('Password is required.')
        .test({
          name: 'root-password-strength',
          // eslint-disable-next-line object-shorthand
          test: function(value) {
            const passwordError = validatePassword(value);
            return passwordError !== null
              ? this.createError({
                  message: passwordError,
                  path: 'root_pass',
                })
              : true;
          },
        }),
    })
  );
};

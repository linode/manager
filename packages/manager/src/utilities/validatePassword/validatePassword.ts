import { string } from 'yup';
import { MINIMUM_PASSWORD_STRENGTH } from 'src/constants';
import { PasswordValidationType } from 'src/featureFlags';
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

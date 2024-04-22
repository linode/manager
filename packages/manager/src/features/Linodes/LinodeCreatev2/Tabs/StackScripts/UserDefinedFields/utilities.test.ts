import { separateUDFsByRequiredStatus } from './utilities';

import type { UserDefinedField } from '@linode/api-v4';

describe('separateUDFsByRequiredStatus', () => {
  it('should seperate udfs by required', () => {
    const requiredUserDefinedField: UserDefinedField = {
      label: 'Server Username',
      name: 'username',
    };

    const optionalUserDefinedField: UserDefinedField = {
      default: 'password',
      label: 'Server Password',
      name: 'password',
    };

    expect(
      separateUDFsByRequiredStatus([
        optionalUserDefinedField,
        requiredUserDefinedField,
      ])
    ).toStrictEqual([[requiredUserDefinedField], [optionalUserDefinedField]]);
  });
});

import {
  getDefaultUDFData,
  getIsUDFHeader,
  getIsUDFMultiSelect,
  getIsUDFPasswordField,
  getIsUDFSingleSelect,
  separateUDFsByRequiredStatus,
} from './utilities';

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

describe('getDefaultUDFData', () => {
  it('should return key-value pairs for values with defaults', () => {
    const udfs: UserDefinedField[] = [
      {
        default: 'admin',
        label: 'Server Username',
        name: 'username',
      },
      {
        label: 'Server Password',
        name: 'password',
      },
    ];

    expect(getDefaultUDFData(udfs)).toStrictEqual({
      password: '',
      username: 'admin',
    });
  });
});

describe('getIsUDFHeader', () => {
  it('should return true if UDF has header with value yes', () => {
    const udf: UserDefinedField = {
      header: 'yes',
      label: 'Server Username',
      name: 'username',
    };

    expect(getIsUDFHeader(udf)).toBe(true);
  });

  it('should return false if UDF has header with value no', () => {
    const udf: UserDefinedField = {
      header: 'no',
      label: 'Server Username',
      name: 'username',
    };

    expect(getIsUDFHeader(udf)).toBe(false);
  });

  it('should return false if UDF has no header value', () => {
    const udf: UserDefinedField = {
      label: 'Server Username',
      name: 'username',
    };

    expect(getIsUDFHeader(udf)).toBe(false);
  });
});

describe('getIsUDFMultiSelect', () => {
  it('should return true if UDF has a manyof value', () => {
    const udf: UserDefinedField = {
      label: 'Server Username',
      manyof: 'php,js,go',
      name: 'username',
    };

    expect(getIsUDFMultiSelect(udf)).toBe(true);
  });

  it('should return false if UDF has no manyof value', () => {
    const udf: UserDefinedField = {
      label: 'Server Username',
      name: 'username',
    };

    expect(getIsUDFMultiSelect(udf)).toBe(false);
  });
});

describe('getIsUDFSingleSelect', () => {
  it('should return true if UDF has a oneOf value', () => {
    const udf: UserDefinedField = {
      label: 'Server Username',
      name: 'username',
      oneof: 'php,js,go',
    };

    expect(getIsUDFSingleSelect(udf)).toBe(true);
  });

  it('should return false if UDF has no oneOf value', () => {
    const udf: UserDefinedField = {
      label: 'Server Username',
      manyof: 'omg',
      name: 'username',
    };

    expect(getIsUDFSingleSelect(udf)).toBe(false);
  });
});

describe('getIsUDFPasswordField', () => {
  it('should return true if UDF has password in the name (any capitalization)', () => {
    const udf: UserDefinedField = {
      label: 'Server Username',
      name: 'PasSwOrd',
    };

    expect(getIsUDFPasswordField(udf)).toBe(true);
  });

  it('should return true if UDF has password in the name', () => {
    const udf: UserDefinedField = {
      label: 'Server Username',
      name: 'password',
    };

    expect(getIsUDFPasswordField(udf)).toBe(true);
  });

  it('should return false if UDF does not have password in the name', () => {
    const udf: UserDefinedField = {
      label: 'Server Username',
      manyof: 'omg',
      name: 'username',
    };

    expect(getIsUDFPasswordField(udf)).toBe(false);
  });
});

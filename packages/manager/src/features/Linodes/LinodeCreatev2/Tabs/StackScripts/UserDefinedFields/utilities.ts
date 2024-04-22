import type { UserDefinedField } from '@linode/api-v4';

/**
 * Used to separate required UDFs from non-required ones
 *
 * @return nested array [[...requiredUDFs], [...nonRequiredUDFs]]
 */
export const separateUDFsByRequiredStatus = (udfs: UserDefinedField[] = []) => {
  return udfs.reduce(
    (accum, udf) => {
      if (getIsUDFOptional(udf)) {
        return [[...accum[0]], [...accum[1], udf]];
      } else {
        return [[...accum[0], udf], [...accum[1]]];
      }
    },
    [[], []]
  );
};

export const getIsUDFOptional = (udf: UserDefinedField) =>
  udf.hasOwnProperty('default') && !udf.hasOwnProperty('required');

export const getIsUDFRequired = (udf: UserDefinedField) => !getIsUDFOptional(udf);

export const getDefaultUDFData = (
  userDefinedFields: UserDefinedField[]
): Record<string, string> =>
  userDefinedFields.reduce((accum, eachField) => {
    if (eachField.default) {
      accum[eachField.name] = eachField.default;
    }
    return accum;
  }, {});

export const isPasswordField = (udfName: string) => {
  return udfName.toLowerCase().includes('password');
};

export const isOneSelect = (udf: UserDefinedField) => {
  return !!udf.oneof; // if we have a oneof prop, it's a radio button
};

export const isMultiSelect = (udf: UserDefinedField) => {
  return !!udf.manyof; // if we have a manyof prop, it's a checkbox
};

export const isHeader = (udf: UserDefinedField) => {
  return udf.header?.toLowerCase() === 'yes';
};

import type { UserDefinedField } from '@linode/api-v4';

/**
 * Used to separate required UDFs from non-required ones
 *
 * @returns nested array [[...requiredUDFs], [...nonRequiredUDFs]]
 */
export const separateUDFsByRequiredStatus = (udfs: UserDefinedField[] = []) => {
  return udfs.reduce(
    (accum, udf) => {
      if (getIsUDFRequired(udf)) {
        return [[...accum[0], udf], accum[1]];
      } else {
        return [accum[0], [...accum[1], udf]];
      }
    },
    [[], []]
  );
};

/**
 * @returns true if a User Defined Field should be considered required
 */
export const getIsUDFRequired = (udf: UserDefinedField) =>
  !Object.prototype.hasOwnProperty.call(udf, 'default') ||
  Object.prototype.hasOwnProperty.call(udf, 'required');

/**
 * Given an array of User Defined Fields, this returns an object of
 * key-value pairs based on the default values.
 */
export const getDefaultUDFData = (
  userDefinedFields: UserDefinedField[]
): Record<string, string> =>
  userDefinedFields.reduce<Record<string, string>>((accum, field) => {
    if (field.default) {
      accum[field.name] = field.default;
    } else {
      accum[field.name] = '';
    }
    return accum;
  }, {});

/**
 * @returns true if a user defined field should be treated as a password
 */
export const getIsUDFPasswordField = (udf: UserDefinedField) => {
  return udf.name.toLowerCase().includes('password');
};

/**
 * @returns true if a user defined field should be treated as a single select
 */
export const getIsUDFSingleSelect = (udf: UserDefinedField) => {
  return !!udf.oneof;
};

/**
 * @returns true if a user defined field should be treated as a multi-select
 */
export const getIsUDFMultiSelect = (udf: UserDefinedField) => {
  return !!udf.manyof;
};

/**
 * @returns true if a user defined field should be treated as a header
 */
export const getIsUDFHeader = (udf: UserDefinedField) => {
  return udf.header?.toLowerCase() === 'yes';
};

/**
 * Gets the total number of nodes that will be created as part of a
 * marketplace app cluster.
 *
 * - Marketplace app clusters use the user-defined-field `cluster_size` to
 *   define the number of nodes.
 * - Complex Marketplace App clusters will use `cluster_size` and other
 *   fields like `{service}_cluster_size`
 */
export const getTotalClusterSize = (
  userDefinedFields: Record<string, string>
) => {
  return Object.entries(userDefinedFields || {})
    .filter(([key]) => key.endsWith('_cluster_size') || key === 'cluster_size')
    .reduce((sum, [_, value]) => sum + Number(value), 0);
};

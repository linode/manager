import { array, lazy, object, string } from 'yup';

import { getDimensionFilterValueSchema } from 'src/features/CloudPulse/Alerts/CreateAlert/Criteria/DimensionFilterValue/ValueSchemas';

const fieldErrorMessage = 'This field is required.';

/**
 * Yup schema for validating a single dimension filter
 */
export const dimensionFiltersSchema = object({
  dimension_label: string()
    .required(fieldErrorMessage)
    .nullable()
    .test('nonNull', fieldErrorMessage, (value) => value !== null),
  operator: string()
    .oneOf(['eq', 'neq', 'startswith', 'endswith', 'in'])
    .required(fieldErrorMessage)
    .nullable()
    .test('nonNull', fieldErrorMessage, (value) => value !== null),
  value: lazy((_, context) => {
    const { dimension_label, operator } = context.parent;
    return getDimensionFilterValueSchema({
      dimensionLabel: dimension_label,
      operator,
    })
      .defined()
      .nullable()
      .test('nonNull', fieldErrorMessage, (value) => value !== null);
  }),
});

/**
 * Yup schema for validating the entire dimension filters form
 */
export const metricDimensionFiltersSchema = object({
  dimension_filters: array().of(dimensionFiltersSchema).required(),
});

import { boolean, mixed, number } from 'yup';
import { array, object, string } from 'yup';

const LABEL_MESSAGE = 'Label must be between 3 and 32 characters';

export const createDatabaseSchema = object({
  label: string()
    .required('Label is required')
    .min(3, LABEL_MESSAGE)
    .max(32, LABEL_MESSAGE),
  engine: string().required('Database Engine is required'),
  region: string().required('Region is required'),
  type: string().required('Type is required'),
  cluster_size: number()
    .oneOf([1, 2, 3], 'Nodes are required')
    .required('Nodes are required'),
  replication_type: string().notRequired().nullable(), // TODO (UIE-8214) remove POST GA
  replication_commit_type: string().notRequired().nullable(), // TODO (UIE-8214) remove POST GA
});

export const updateDatabaseSchema = object({
  label: string().notRequired().min(3, LABEL_MESSAGE).max(32, LABEL_MESSAGE),
  allow_list: array().of(string()).notRequired(),
  updates: object()
    .notRequired()
    .shape({
      frequency: string().oneOf(['weekly', 'monthly']),
      duration: number(),
      hour_of_day: number(),
      day_of_week: number(),
      week_of_month: number().nullable(),
    })
    .nullable(),
  type: string().notRequired(),
});

/**
 * Creates a base Yup validator based on the field type.
 */
const createValidator = (key: string, field: any) => {
  const fieldTypes = Array.isArray(field.type) ? field.type : [field.type];

  switch (true) {
    case fieldTypes.includes('integer'):
      return number()
        .transform((val, originalVal) => (originalVal === '' ? undefined : val))
        .integer(`${key} must be a whole number`)
        .required(`${key} is required`);

    case fieldTypes.includes('number'):
      return number()
        .transform((val, originalVal) => (originalVal === '' ? undefined : val))
        .required(`${key} is required`);

    case fieldTypes.includes('string'):
      return string();

    case fieldTypes.includes('boolean'):
      return boolean();

    default:
      return null;
  }
};

/**
 * Applies validation constraints (min, max, length, pattern) to a Yup validator.
 */
const applyConstraints = (validator: any, key: string, field: any) => {
  if (!validator) return null;

  if (field.minimum !== undefined) {
    validator = validator.min(
      field.minimum,
      `${key} must be at least ${field.minimum}`,
    );
  }
  if (field.maximum !== undefined) {
    validator = validator.max(
      field.maximum,
      `${key} must be at most ${field.maximum}`,
    );
  }
  if (field.minLength !== undefined) {
    validator = validator.min(
      field.minLength,
      `${key} must be at least ${field.minLength} characters`,
    );
  }
  if (field.maxLength !== undefined) {
    validator = validator.max(
      field.maxLength,
      `${key} must be at most ${field.maxLength} characters`,
    );
  }
  if (field.pattern) {
    let pattern = field.pattern;
    if (key === 'default_time_zone') {
      pattern = '^(SYSTEM|[+-](0[0-9]|1[0-2]):([0-5][0-9]))$';
    }
    validator = validator.matches(
      new RegExp(pattern),
      `Please ensure that ${key} follows the format ${field.example}`,
    );
  }
  if (key === 'timezone') {
    if (
      field.value === undefined ||
      field.value === null ||
      field.value === ''
    ) {
      validator = validator.required('timezone cannot be empty');
    }
  }

  return validator;
};

/**
 * Processes a single field from the API configuration and adds it to the schema.
 */
const processField = (schemaShape: Record<string, any>, field: any) => {
  if (!field.label || !field.type) {
    return;
  }

  const key = field.label;
  let validator = createValidator(key, field);
  validator = applyConstraints(validator, key, field);

  if (validator) {
    schemaShape[key] = object().shape({ value: validator });
  }
};

/**
 * Main function that creates a Yup validation schema dynamically based on API configurations.
 */
export const createDynamicAdvancedConfigSchema = (allConfigurations: any[]) => {
  if (!Array.isArray(allConfigurations) || allConfigurations.length === 0) {
    return object().shape({});
  }

  const schemaShape: Record<string, any> = {};

  allConfigurations.forEach((field) => processField(schemaShape, field));
  return object().shape({
    configs: array().of(
      object({
        label: string().required(),
        value: mixed().when('label', (label, schema) => {
          if (Array.isArray(label)) {
            label = label[0];
          }

          if (typeof label !== 'string' || !schemaShape[label]) {
            return schema;
          }

          const valueSchema = schemaShape[label]?.fields?.value;
          return valueSchema ? valueSchema : schema;
        }),
      }),
    ),
  });
};

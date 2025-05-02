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
    if (field.maximum > Number.MAX_SAFE_INTEGER) {
      validator = validator.max(
        Number.MAX_SAFE_INTEGER,
        `${key} must be at most ${Number.MAX_SAFE_INTEGER}`,
      );
    } else {
      validator = validator.max(
        field.maximum,
        `${key} must be at most ${field.maximum}`,
      );
    }
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
    const pattern = field.pattern;
    if (key === 'default_time_zone') {
      validator = validator.matches(
        new RegExp(pattern),
        `${key} must be an IANA timezone, 'SYSTEM', or a valid UTC offset (e.g., '+03:00')`,
      );
    } else {
      validator = validator.matches(
        new RegExp(pattern),
        `Please ensure that ${key} follows the format ${field.example}`,
      );
    }
  }
  // custom validation for wal_sender_timeout since it has a special case
  // where it can be 0 or between 5000 and 10800000
  if (key === 'wal_sender_timeout') {
    validator = validator.test(
      'is-zero-or-in-range',
      `${key} must be 0 or between 5000 and 10800000`,
      (value: boolean | number | string) => {
        if (typeof value !== 'number') return false;
        return value === 0 || (value >= 5000 && value <= 10800000);
      },
    );
  }
  if (key === 'timezone') {
    if (!field.value) {
      validator = validator.required('timezone cannot be empty');
    }
  }
  if (key === 'net_buffer_length') {
    validator = validator.test(
      'is-multiple-of-1024',
      `${key} must be a multiple of 1024`,
      (value: boolean | number | string) => {
        if (typeof value !== 'number') return false;
        return value % 1024 === 0;
      },
    );
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

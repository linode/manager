import { array, boolean, number, object, string } from 'yup';

const LABEL_MESSAGE = 'Label must be between 3 and 64 characters.';
const LABEL_REQUIREMENTS =
  'Label must include only ASCII letters, numbers, and dashes.';

const labelTestDetails = {
  testName: 'no two dashes in a row',
  testMessage: 'Label must not contain two dashes in a row.',
};
/**
 * Valid port sizes for NAT Gateway.
 */
const VALID_PORT_SIZES = [
  64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
] as const;

/**
 * During beta/LA phase, minimum is 4096 ports (up to 15 interfaces per IP).
 */
const BETA_MIN_PORTS_PER_INTERFACE = 4096;

/**
 * Default maximum addresses per NAT Gateway.
 * Support can override this limit for specific customers.
 */
const DEFAULT_MAX_ADDRESSES_PER_NAT_GATEWAY = 20;

/**
 * Default fallback values when settings API is unavailable.
 * These should NOT be used directly in validation - use the factory function instead.
 */
export const NAT_GATEWAY_DEFAULTS = {
  maxAddressesPerNATGateway: DEFAULT_MAX_ADDRESSES_PER_NAT_GATEWAY,
  minPortsPerInterface: BETA_MIN_PORTS_PER_INTERFACE,
  validPortSizes: VALID_PORT_SIZES,
} as const;

/**
 * Schema for individual NAT Gateway address object. API allows NAT Gateway creation with no addresses.
 */
const natGatewayAddressObjectSchema = object({
  address: string().nullable(),
});

/**
 * Label validation that matches VPC/subnet rules from the API spec.
 * - Must be 3-64 characters
 * - Letters, numbers, and hyphens only
 * - Cannot contain consecutive hyphens (--)
 */
const labelValidation = string()
  .test(
    labelTestDetails.testName,
    labelTestDetails.testMessage,
    (value) => !value?.includes('--'),
  )
  .min(3, LABEL_MESSAGE)
  .max(64, LABEL_MESSAGE)
  .matches(/^[a-zA-Z0-9-]*$/, LABEL_REQUIREMENTS);

/**
 * Options for creating the NAT Gateway validation schema.
 * These values should come from the settings API response.
 */
export interface CreateNATGatewaySchemaOptions {
  allowedPortSizes?: readonly number[];
  maxAddresses?: number;
  minPortsPerInterface?: number;
}

/**
 * Factory function to create a NAT Gateway validation schema with dynamic limits.
 *
 * @param options - Configuration from settings API. Falls back to defaults if not provided.
 *
 * @example
 * // In component, use with settings API data:
 * const { data: settings } = useNATGatewaySettingsQuery();
 * const schema = createNATGatewayValidationSchema({
 *   maxAddresses: settings?.maximum_reserved_addresses_per_natgateway,
 * });
 */
export const createNATGatewayValidationSchema = (
  options?: CreateNATGatewaySchemaOptions,
) => {
  const maxAddresses =
    options?.maxAddresses ?? NAT_GATEWAY_DEFAULTS.maxAddressesPerNATGateway;
  const minPorts =
    options?.minPortsPerInterface ?? NAT_GATEWAY_DEFAULTS.minPortsPerInterface;
  const allowedPorts =
    options?.allowedPortSizes ?? NAT_GATEWAY_DEFAULTS.validPortSizes;

  return object({
    region: string()
      .required('Region is required')
      .min(1, 'Region must not be empty'),

    label: labelValidation.required('Label is required'),

    addresses: array()
      .of(natGatewayAddressObjectSchema)
      .max(
        maxAddresses,
        `Cannot assign more than ${maxAddresses} addresses to a NAT Gateway`,
      )
      .notRequired(),

    default_ports_per_interface: number()
      .oneOf([...allowedPorts], `Must be one of: ${allowedPorts.join(', ')}`)
      .min(minPorts, `Minimum ports per interface is ${minPorts}`)
      .notRequired(),

    use_autoscaling: boolean().notRequired(),

    vpc_subnet_id: number().notRequired(),
  }).test(
    'autoscaling-addresses-conflict',
    'Addresses must be empty when autoscaling is enabled',
    function (value) {
      const { use_autoscaling, addresses } = value;

      if (use_autoscaling === true && addresses && addresses.length > 0) {
        return this.createError({
          path: 'addresses',
          message: 'Addresses must be empty when autoscaling is enabled',
        });
      }

      return true;
    },
  );
};

/**
 * Schema for updating a NAT Gateway.
 * Only the label can be updated.
 */
export const updateNATGatewaySchema = object({
  label: labelValidation.notRequired(),
});

/**
 * Schema for adding an address to a NAT Gateway.
 *
 * Note: The following validations require API calls:
 * - Address must be a reserved IP owned by the customer
 * - Address must not currently be in use
 * - NAT Gateway must not be using autoscaling
 */
export const addNATGatewayAddressSchema = object({
  address: string().required('Address is required'),
});

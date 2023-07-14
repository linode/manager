import ipaddr from 'ipaddr.js';
import { array, object, string } from 'yup';

const LABEL_MESSAGE = 'VPC label must be between 1 and 64 characters.';
const LABEL_REQUIRED = 'Label is required';
const LABEL_REQUIREMENTS =
  'Must include only ASCII letters, numbers, and dashes';

const labelTestDetails = {
  testName: 'no two dashes in a row',
  testMessage: 'Must not contain two dashes in a row',
};

const validateIP = (value?: string): boolean => {
  if (!value) {
    return false;
  }

  try {
    const addr = ipaddr.parse(value);
    const type = addr.kind();

    if (type === 'ipv4') {
      ipaddr.IPv4.isValid(value);
      ipaddr.IPv4.parseCIDR(value);
    } else if (type === 'ipv6') {
      ipaddr.IPv6.parseCIDR(value);
    } else {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

const labelValidation = string()
  .test(
    labelTestDetails.testName,
    labelTestDetails.testMessage,
    (value) => !value?.includes('--')
  )
  .min(1, LABEL_MESSAGE)
  .max(64, LABEL_MESSAGE)
  .matches(/[a-zA-Z0-9-]+/, LABEL_REQUIREMENTS);

export const createVPCSchema = object({
  label: labelValidation.required(LABEL_REQUIRED),
  description: string(),
  region: string().required('Region is required'),
  subnets: array().of(object()),
});

export const updateVPCSchema = object({
  label: labelValidation.notRequired(),
  description: string().notRequired(),
});

export const createSubnetSchema = object().shape(
  {
    label: labelValidation.required(LABEL_REQUIRED),
    ipv4: string()
      .test({
        name: 'cidr',
        message: 'The IPv4 range must be in CIDR format',
        test: validateIP,
      })
      .notRequired()
      .ensure()
      .when('ipv6', {
        is: '',
        then: string().required(),
      }),
    ipv6: string()
      .test({
        name: 'cidr mask',
        message: 'Must be the subnet mask of the IP, e.g. /24',
        test: validateIP,
      })
      .notRequired()
      .ensure()
      .when('ipv4', {
        is: '',
        then: string().required(),
      }),
  },
  [['ipv6', 'ipv4']]
);

export const modifySubnetSchema = object({
  label: labelValidation.required(LABEL_REQUIRED),
});

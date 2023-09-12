import { handleAPIErrors, handleVPCAndSubnetErrors } from './formikErrorUtils';

const errorWithoutField = [{ reason: 'Internal server error' }];
const errorWithField = [
  { field: 'data.card_number', reason: 'Invalid credit card number' },
];

afterEach(() => {
  jest.clearAllMocks();
});

const setFieldError = jest.fn();
const setError = jest.fn();

describe('handleAPIErrors', () => {
  it('should handle api error with a field', () => {
    handleAPIErrors(errorWithField, setFieldError, setError);
    expect(setFieldError).toHaveBeenCalledWith(
      'card_number',
      errorWithField[0].reason
    );
    expect(setError).not.toHaveBeenCalled();
  });

  it('should handle a general api error', () => {
    handleAPIErrors(errorWithoutField, setFieldError, setError);
    expect(setFieldError).not.toHaveBeenCalledWith();
    expect(setError).toHaveBeenCalledWith(errorWithoutField[0].reason);
  });
});

const subnetMultipleErrorsPerField = [
  {
    reason: 'not expected error for label',
    field: 'subnets[0].label',
  },
  {
    reason: 'expected error for label',
    field: 'subnets[0].label',
  },
  {
    reason: 'not expected error for label',
    field: 'subnets[3].label',
  },
  {
    reason: 'expected error for label',
    field: 'subnets[3].label',
  },
  {
    reason: 'not expected error for ipv4',
    field: 'subnets[3].ipv4',
  },
  {
    reason: 'expected error for ipv4',
    field: 'subnets[3].ipv4',
  },
];

const generalSubnetErrors = [
  {
    reason: 'Label required',
    field: 'subnets[1].label',
  },
  {
    reason: 'bad label',
    field: 'subnets[2].label',
  },
  {
    reason: 'cidr ipv4',
    field: 'subnets[2].ipv4',
  },
  {
    reason: 'needs an ip',
    field: 'subnets[4].ipv4',
  },
  {
    reason: 'needs an ipv6',
    field: 'subnets[4].ipv6',
  },
];

describe('handleVpcAndConvertSubnetErrors', () => {
  it('converts API errors for subnets into a map of subnet index to SubnetErrors', () => {
    const errors = handleVPCAndSubnetErrors(
      generalSubnetErrors,
      setFieldError,
      setError
    );
    expect(Object.keys(errors)).toHaveLength(3);
    expect(Object.keys(errors)).toEqual(['1', '2', '4']);
    expect(errors[1]).toEqual({ label: 'Label required' });
    expect(errors[2]).toEqual({ label: 'bad label', ipv4: 'cidr ipv4' });
    expect(errors[4]).toEqual({ ipv4: 'needs an ip', ipv6: 'needs an ipv6' });
  });

  it('takes the last error to display if a subnet field has multiple errors associated with it', () => {
    const errors = handleVPCAndSubnetErrors(
      subnetMultipleErrorsPerField,
      setFieldError,
      setError
    );
    expect(Object.keys(errors)).toHaveLength(2);
    expect(errors[0]).toEqual({ label: 'expected error for label' });
    expect(errors[3]).toEqual({
      label: 'expected error for label',
      ipv4: 'expected error for ipv4',
    });
  });

  it('passes errors without the subnet field to handleApiErrors', () => {
    const errors = handleVPCAndSubnetErrors(
      errorWithField,
      setFieldError,
      setError
    );
    expect(Object.keys(errors)).toHaveLength(0);
    expect(errors).toEqual({});
    expect(setFieldError).toHaveBeenCalledWith(
      'card_number',
      errorWithField[0].reason
    );
    expect(setError).not.toHaveBeenCalled();
  });
});

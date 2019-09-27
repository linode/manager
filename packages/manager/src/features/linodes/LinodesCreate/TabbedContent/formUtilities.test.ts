import { APIError } from 'linode-js-sdk/lib/types';
import { filterUDFErrors } from './formUtilities';

describe('Linode Create Utilities', () => {
  it('should filter out all errors except UDF errors', () => {
    const mockErrors: APIError[] = [
      {
        field: 'label',
        reason: 'label is required'
      },
      {
        field: 'ssh_keys',
        reason: 'ssh_keys are required'
      },
      {
        field: 'wp_password',
        reason: 'a value for the UDF is required'
      }
    ];

    const errorResources = {
      label: 'A label',
      ssh_keys: 'ssh_keys'
    };

    const filteredErrors = filterUDFErrors(errorResources, mockErrors);
    expect(filteredErrors[0].field).toBe('wp_password');
    expect(filteredErrors).toHaveLength(1);
  });
});

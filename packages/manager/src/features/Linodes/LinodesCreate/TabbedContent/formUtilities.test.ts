import { filterUDFErrors } from './formUtilities';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

describe('Linode Create Utilities', () => {
  it('should filter out all errors except UDF errors', () => {
    const mockErrors: FormattedAPIError[] = [
      {
        field: 'label',
        formattedReason: 'label is required',
        reason: 'label is required',
      },
      {
        field: 'ssh_keys',
        formattedReason: 'ssh_keys are required',
        reason: 'ssh_keys are required',
      },
      {
        field: 'wp_password',
        formattedReason: 'a value for the UDF is required',
        reason: 'a value for the UDF is required',
      },
    ];

    const errorResources = {
      label: 'A label',
      ssh_keys: 'ssh_keys',
    };

    const filteredErrors = filterUDFErrors(errorResources, mockErrors);
    expect(filteredErrors[0].field).toBe('wp_password');
    expect(filteredErrors).toHaveLength(1);
  });
});

import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { quotaFactory, quotaUsageFactory } from 'src/factories/quotas';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { QuotasIncreaseForm } from './QuotasIncreaseForm';

describe('QuotasIncreaseForm', () => {
  it('should render with default values', async () => {
    const {
      getByLabelText,
      getByPlaceholderText,
      getByRole,
      getByText,
    } = renderWithTheme(
      <QuotasIncreaseForm
        quota={{
          ...quotaFactory.build(),
          ...quotaUsageFactory.build(),
        }}
        onClose={() => {}}
        onSuccess={() => {}}
        open={true}
      />
    );

    expect(getByLabelText('Title (required)')).toHaveValue('Increase Quota');
    expect(getByLabelText('Quantity (required)')).toHaveValue(0);
    expect(getByText('In us-east (initial limit of 50)')).toBeInTheDocument();

    await waitFor(() => {
      // eslint-disable-next-line xss/no-mixed-html
      expect(
        getByPlaceholderText('Enter your request for a quota increase.')
      ).toHaveValue(
        '**User**: mock-user<br>\n**Email**: mock-user@linode.com<br>\n**Quota Name**: Linode Dedicated vCPUs<br>\n**New Quantity Requested**: 0 CPU<br>\n**Region**: us-east'
      );
    });

    expect(getByRole('button', { name: 'Cancel' })).toBeEnabled();
    expect(getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('description should be updated as quantity is changed', async () => {
    const { getByLabelText, getByPlaceholderText, getByRole } = renderWithTheme(
      <QuotasIncreaseForm
        quota={{
          ...quotaFactory.build(),
          ...quotaUsageFactory.build(),
        }}
        onClose={() => {}}
        onSuccess={() => {}}
        open={true}
      />
    );

    const quantityInput = getByLabelText('Quantity (required)');
    fireEvent.change(quantityInput, { target: { value: 2 } });

    await waitFor(() => {
      // eslint-disable-next-line xss/no-mixed-html
      expect(
        getByPlaceholderText('Enter your request for a quota increase.')
      ).toHaveValue(
        '**User**: mock-user<br>\n**Email**: mock-user@linode.com<br>\n**Quota Name**: Linode Dedicated vCPUs<br>\n**New Quantity Requested**: 2 CPUs<br>\n**Region**: us-east'
      );
      expect(getByRole('button', { name: 'Submit' })).toBeEnabled();
    });
  });
});

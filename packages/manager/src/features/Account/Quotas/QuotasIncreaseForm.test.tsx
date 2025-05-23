import { act, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { quotaFactory, quotaUsageFactory } from 'src/factories/quotas';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { QuotasIncreaseForm } from './QuotasIncreaseForm';

describe('QuotasIncreaseForm', () => {
  it('should render with default values', async () => {
    const { getByLabelText, getByRole, getByTestId, getByText } =
      renderWithTheme(
        <QuotasIncreaseForm
          convertedResourceMetrics={{
            limit: 100,
            metric: 'GB',
          }}
          onClose={() => {}}
          onSuccess={() => {}}
          open={true}
          quota={{
            ...quotaFactory.build(),
            ...quotaUsageFactory.build(),
          }}
          selectedService={{
            label: 'Object Storage',
            value: 'object-storage',
          }}
        />
      );

    expect(getByLabelText('Title (required)')).toHaveValue(
      'Increase Object Storage Quota'
    );
    expect(getByLabelText('New Quota (required)')).toHaveValue(0);
    expect(getByText('Current quota in us-east: 100 GB')).toBeInTheDocument();
    expect(getByLabelText('Description (required)')).toHaveValue('');
    expect(getByText('Ticket Preview')).toBeInTheDocument();
    expect(
      getByTestId('quota-increase-form-preview').firstChild?.firstChild
    ).toHaveAttribute('aria-expanded', 'false');

    expect(getByRole('button', { name: 'Cancel' })).toBeEnabled();
    expect(getByRole('button', { name: 'Submit' })).toBeEnabled();
  });

  it('description should be updated as quantity is changed', async () => {
    const { getByLabelText, getByTestId } = renderWithTheme(
      <QuotasIncreaseForm
        convertedResourceMetrics={{
          limit: 100,
          metric: 'GB',
        }}
        onClose={() => {}}
        onSuccess={() => {}}
        open={true}
        quota={{
          ...quotaFactory.build(),
          ...quotaUsageFactory.build(),
        }}
        selectedService={{
          label: 'Object Storage',
          value: 'object-storage',
        }}
      />
    );

    const quantityInput = getByLabelText('New Quota (required)');
    const descriptionInput = getByLabelText('Description (required)');
    const preview = getByTestId('quota-increase-form-preview');
    const previewContent = getByTestId('quota-increase-form-preview-content');

    await waitFor(() => {
      act(() => {
        fireEvent.change(quantityInput, { target: { value: 2 } });
        fireEvent.change(descriptionInput, { target: { value: 'test!' } });
        fireEvent.click(preview);
      });
    });

    await waitFor(() => {
      expect(previewContent).toHaveTextContent(
        'Increase Object Storage QuotaUser: mock-user Email: mock-user@linode.com Quota Name: Linode Dedicated vCPUs Current Quota: 100 GB New Quota Requested: 2 GB Needed in: Fewer than 7 days Region: us-east test!'
      );
    });
  });
});

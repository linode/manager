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
        />
      );

    expect(getByLabelText('Title (required)')).toHaveValue('Increase Quota');
    expect(getByLabelText('Quantity (required)')).toHaveValue(0);
    expect(getByText('In us-east (initial limit of 50)')).toBeInTheDocument();
    expect(getByLabelText('Notes')).toHaveValue('');
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
      />
    );

    const quantityInput = getByLabelText('Quantity (required)');
    const notesInput = getByLabelText('Notes');
    const preview = getByTestId('quota-increase-form-preview');
    const previewContent = getByTestId('quota-increase-form-preview-content');

    await waitFor(() => {
      act(() => {
        fireEvent.change(quantityInput, { target: { value: 2 } });
        fireEvent.change(notesInput, { target: { value: 'test!' } });
        fireEvent.click(preview);
      });
    });

    await waitFor(() => {
      expect(previewContent).toHaveTextContent(
        'Increase QuotaUser: mock-user Email: mock-user@linode.com Quota Name: Linode Dedicated vCPUs New Quantity Requested: 2 CPUs Region: us-east test!'
      );
    });
  });
});

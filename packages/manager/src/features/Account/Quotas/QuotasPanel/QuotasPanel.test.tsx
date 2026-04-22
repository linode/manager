import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  linodeQuotaService,
  objectStorageQuotaService,
} from 'src/features/Account/Quotas/quotaServices';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { QuotasPanel } from './QuotasPanel';

vi.mock('./QuotasTable', () => ({
  QuotasTable: (props: Record<string, any>) => (
    <div data-testid="mock-table">scopeValue:{String(props.scopeValue)}</div>
  ),
}));

vi.mock('./ScopeValueSelect', () => ({
  ScopeValueSelect: (props: Record<string, any>) => (
    <button data-testid="mock-select" onClick={() => props.onChange('us-east')}>
      mock-select
    </button>
  ),
}));

describe('QuotasPanel', () => {
  it('renders global scope without selector and shows table', () => {
    const { getByText, queryByTestId, getByTestId } = renderWithTheme(
      <QuotasPanel scope={'global'} service={objectStorageQuotaService()} />
    );

    expect(getByText('Object Storage: global')).toBeInTheDocument();
    // No selector for global scope
    expect(queryByTestId('mock-select')).toBeNull();
    // Table is still rendered
    expect(getByTestId('mock-table')).toBeInTheDocument();
  });

  it('renders non-global scope with selector and updates scopeValue', async () => {
    const { getByText, getByTestId } = renderWithTheme(
      <QuotasPanel scope={'region'} service={linodeQuotaService} />
    );

    expect(getByText('Linodes: per-region')).toBeInTheDocument();
    expect(
      getByText('View your Linodes quotas by applying the region filter below.')
    ).toBeInTheDocument();

    const select = getByTestId('mock-select');
    await userEvent.click(select);

    expect(getByTestId('mock-table')).toHaveTextContent('scopeValue:us-east');
  });
});

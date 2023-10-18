// RulesTable.test.tsx

import '@testing-library/jest-dom/extend-expect';
import React from 'react';

import { routeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RulesTable } from './RulesTable';

// Mock data for testing
const mockRoute = routeFactory.build({
  protocol: 'http',
  rules: [
    {
      match_condition: {
        match_value: '/images/*',
      },
      service_targets: [],
    },
  ],
});

describe('RulesTable', () => {
  it('renders table headers', () => {
    const { getByText } = renderWithTheme(
      <RulesTable loadbalancerId={1} onEditRule={vi.fn()} route={mockRoute} />
    );
    expect(getByText('Execution')).toBeInTheDocument();
    expect(getByText('Match Value')).toBeInTheDocument();
  });

  it('renders empty table when no rules are provided', () => {
    const { getByText } = renderWithTheme(
      <RulesTable
        loadbalancerId={1}
        onEditRule={vi.fn()}
        route={{ id: 0, label: 'test', protocol: 'http', rules: [] }}
      />
    );
    expect(getByText('No Rules')).toBeInTheDocument();
  });

  it('renders rules correctly', () => {
    const { getByText } = renderWithTheme(
      <RulesTable loadbalancerId={1} onEditRule={vi.fn()} route={mockRoute} />
    );

    expect(getByText('First')).toBeInTheDocument();
    expect(getByText('/images/*')).toBeInTheDocument();
  });
});

// RulesTable.test.tsx

import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import React from 'react';

import { routeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RulesTable } from './RulesTable';

// Mock data for testing
const mockRoute = routeFactory.buildList(1)[0];

describe('RulesTable', () => {
  it('renders table headers', () => {
    renderWithTheme(<RulesTable loadbalancerId={1} route={mockRoute} />);
    expect(screen.getByText('Execution')).toBeInTheDocument();
    expect(screen.getByText('Match Value')).toBeInTheDocument();
  });

  it('renders empty table when no rules are provided', () => {
    renderWithTheme(
      <RulesTable
        loadbalancerId={1}
        route={{ id: 0, label: 'test', protocol: 'http', rules: [] }}
      />
    );
    expect(screen.getByText('No Linodes')).toBeInTheDocument();
  });

  it('renders rules correctly', () => {
    renderWithTheme(<RulesTable loadbalancerId={1} route={mockRoute} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('/images/*')).toBeInTheDocument();
  });
});

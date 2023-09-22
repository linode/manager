// RulesTable.test.tsx

import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import React from 'react';

import { routeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RulesTable } from './RulesTable';

// Mock data for testing
const mockRules = routeFactory.buildList(1)[0].rules;

describe('RulesTable', () => {
  it('renders table headers', () => {
    renderWithTheme(<RulesTable rules={mockRules} />);

    expect(screen.getByText('Execution')).toBeInTheDocument();
    expect(screen.getByText('Match Value')).toBeInTheDocument();
    expect(screen.getByText('Match Type')).toBeInTheDocument();
    expect(screen.getByText('Service Targets')).toBeInTheDocument();
    expect(screen.getByText('Session Stickiness')).toBeInTheDocument();
  });

  it('renders empty table when no rules are provided', () => {
    renderWithTheme(<RulesTable rules={[]} />);

    expect(screen.getByText('No Linodes')).toBeInTheDocument();
  });

  it('renders rules correctly', () => {
    renderWithTheme(<RulesTable rules={mockRules} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('path_prefix')).toBeInTheDocument();
    expect(screen.getByText('/images/*')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });
});

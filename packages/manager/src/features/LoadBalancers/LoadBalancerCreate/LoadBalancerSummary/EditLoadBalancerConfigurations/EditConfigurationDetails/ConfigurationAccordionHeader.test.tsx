import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ConfigurationAccordionHeader } from './ConfigurationAccordionHeader';

import type { LoadBalancerCreateFormData } from '../../../LoadBalancerCreateFormWrapper';

describe('ConfigurationAccordionHeader', () => {
  const mockConfiguration: LoadBalancerCreateFormData['configurations'][number] = {
    certificates: [],
    label: 'test-config-label',
    port: 8080,
    protocol: 'http',
    routes: [{ label: 'route-label', protocol: 'http', rules: [] }],
    service_targets: [],
  };

  test('renders configuration label and routes count', () => {
    renderWithTheme(
      <ConfigurationAccordionHeader
        configuration={mockConfiguration}
        editClickHandler={vi.fn()}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Configuration — test-config-label' })
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();

    expect(screen.getByText('1 Route')).toBeInTheDocument(); // Adjust based on pluralize function
  });

  test('calls editClickHandler when edit button is clicked', () => {
    const mockEditClickHandler = vi.fn();
    renderWithTheme(
      <ConfigurationAccordionHeader
        configuration={mockConfiguration}
        editClickHandler={mockEditClickHandler}
      />
    );

    userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(mockEditClickHandler).toHaveBeenCalled();
  });
});

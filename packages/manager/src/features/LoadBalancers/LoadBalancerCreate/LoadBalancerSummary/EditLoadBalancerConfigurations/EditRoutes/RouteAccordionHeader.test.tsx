import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { RouteAccordionHeader } from './RouteAccordionHeader';

import type { RoutePayload } from '@linode/api-v4';

describe('RouteAccordionHeader', () => {
  const mockRoute: RoutePayload = {
    label: 'route-label',
    protocol: 'http',
    rules: [],
  };

  test('renders route label and rule count', () => {
    renderWithTheme(
      <RouteAccordionHeader handleEditRoute={vi.fn()} route={mockRoute} />
    );

    expect(
      screen.getByRole('heading', { name: 'route-label' })
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();

    expect(screen.getByText('0 Rules')).toBeInTheDocument(); // Adjust based on pluralize function
  });

  test('calls editClickHandler when edit button is clicked', () => {
    const mockEditClickHandler = vi.fn();
    renderWithTheme(
      <RouteAccordionHeader
        handleEditRoute={mockEditClickHandler}
        route={mockRoute}
      />
    );

    userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(mockEditClickHandler).toHaveBeenCalled();
  });
});

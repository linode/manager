import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Tab } from './Tab';

describe('Tab Component', () => {
  it('renders tab with children', () => {
    renderWithTheme(<Tab>Hello Tab</Tab>);

    const tabElement = screen.getByText('Hello Tab');
    expect(tabElement).toBeInTheDocument();
  });

  it('applies styles correctly', () => {
    renderWithTheme(<Tab>Hello Tab</Tab>);

    const tabElement = screen.getByText('Hello Tab');

    expect(tabElement).toHaveStyle(`
      display: inline-flex;
      color: rgb(1, 116, 188);
    `);
  });

  it('handles disabled state', () => {
    renderWithTheme(<Tab disabled>Click Me</Tab>);

    const tabElement = screen.getByText('Click Me');

    expect(tabElement).toHaveAttribute('aria-disabled', 'true');
  });
});

import { screen } from '@testing-library/react';
import React from 'react';

import { Tabs } from 'src/components/Tabs/Tabs';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Tab } from './Tab';

describe('Tab Component', () => {
  it('renders tab with children', () => {
    renderWithTheme(
      <Tabs>
        <Tab>Hello Tab</Tab>
      </Tabs>
    );

    const tabElement = screen.getByText('Hello Tab');
    expect(tabElement).toBeInTheDocument();
  });

  it('applies styles correctly', () => {
    renderWithTheme(
      <Tabs>
        <Tab>Hello Tab</Tab>
      </Tabs>
    );

    const tabElement = screen.getByText('Hello Tab');

    expect(tabElement).toHaveStyle(`
      display: inline-flex;
      color: rgb(52, 52, 56);
    `);
  });

  it('handles disabled state', () => {
    renderWithTheme(
      <Tabs>
        <Tab disabled>Click Me</Tab>
      </Tabs>
    );

    const tabElement = screen.getByText('Click Me');

    expect(tabElement).toHaveAttribute('aria-disabled', 'true');
  });
});

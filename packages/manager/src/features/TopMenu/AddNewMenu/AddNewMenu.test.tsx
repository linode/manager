import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddNewMenu } from './AddNewMenu';

describe('AddNewMenu', () => {
  test('renders the Create button', () => {
    const { getByText } = renderWithTheme(<AddNewMenu />);
    const createButton = getByText('Create');
    expect(createButton).toBeInTheDocument();
  });

  test('opens the menu on button click', () => {
    const { getByText, getByRole } = renderWithTheme(<AddNewMenu />);
    const createButton = getByText('Create');
    fireEvent.click(createButton);
    const menu = getByRole('menu');
    expect(menu).toBeInTheDocument();
  });

  test('renders Linode menu item', () => {
    const { getByText } = renderWithTheme(<AddNewMenu />);
    const createButton = getByText('Create');
    fireEvent.click(createButton);
    const menuItem = getByText('Linode');
    expect(menuItem).toBeInTheDocument();
  });

  test('the linode menu item links to the linode create page', () => {
    const { getByText } = renderWithTheme(<AddNewMenu />);

    const createButton = getByText('Create');
    fireEvent.click(createButton);

    const menuItem = getByText('Linode');

    expect(menuItem.closest('a')).toHaveAttribute('href', '/linodes/create');
  });

  test('does not render hidden menu items', () => {
    const { getByText, queryByText } = renderWithTheme(<AddNewMenu />, {
      flags: { databases: false },
    });
    const createButton = getByText('Create');
    fireEvent.click(createButton);

    ['Database'].forEach((createMenuItem: string) => {
      const hiddenMenuItem = queryByText(createMenuItem);
      expect(hiddenMenuItem).toBeNull();
    });
  });
});

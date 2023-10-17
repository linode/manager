import { fireEvent } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

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

  test('navigates to Linode create page on Linode menu item click', () => {
    // Create a mock history object
    const history = createMemoryHistory();

    // Render the component with the Router and history
    const { getByText } = renderWithTheme(
      <Router history={history}>
        <AddNewMenu />
      </Router>
    );

    const createButton = getByText('Create');
    fireEvent.click(createButton);

    const menuItem = getByText('Linode');
    fireEvent.click(menuItem);

    // Assert that the history's location has changed to the expected URL
    expect(history.location.pathname).toBe('/linodes/create');
  });

  test('does not render hidden menu item', () => {
    const mockedUseFlags = jest.fn().mockReturnValue({ aglb: false });
    jest.mock('src/hooks/useFlags', () => ({
      __esModule: true,
      useFlags: mockedUseFlags,
    }));

    const { getByText, queryByText } = renderWithTheme(<AddNewMenu />);
    const createButton = getByText('Create');
    fireEvent.click(createButton);
    const hiddenMenuItem = queryByText('Global Load Balancer');
    expect(hiddenMenuItem).toBeNull();
  });

  test('does not render hidden menu item - databases', () => {
    const mockedUseFlags = jest.fn().mockReturnValue({ databases: false });
    jest.mock('src/hooks/useFlags', () => ({
      __esModule: true,
      useFlags: mockedUseFlags,
    }));

    const { getByText, queryByText } = renderWithTheme(<AddNewMenu />);
    const createButton = getByText('Create');
    fireEvent.click(createButton);
    const hiddenMenuItem = queryByText('Create Database');
    expect(hiddenMenuItem).toBeNull();
  });
});

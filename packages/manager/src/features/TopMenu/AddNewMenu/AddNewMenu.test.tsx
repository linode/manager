import { fireEvent } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddNewMenu } from './AddNewMenu';

vi.mock('src/hooks/useFlags', async () => {
  const actual = await vi.importActual<any>('src/hooks/useFlags');
  return {
    ...actual,
    __esModule: true,
    useFlags: vi.fn().mockReturnValue({
      aglb: false,
      databases: false,
    }),
  };
});

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

  test('does not render hidden menu items', () => {
    const { getByText, queryByText } = renderWithTheme(<AddNewMenu />);
    const createButton = getByText('Create');
    fireEvent.click(createButton);

    ['Global Load Balancer', 'Database'].forEach((createMenuItem: string) => {
      const hiddenMenuItem = queryByText(createMenuItem);
      expect(hiddenMenuItem).toBeNull();
    });
  });
});

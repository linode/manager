import { userEvent } from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import { accountFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateMenu } from './CreateMenu';

describe('CreateMenu', () => {
  it('renders the Create button', () => {
    const { getByText } = renderWithTheme(<CreateMenu />);
    const createButton = getByText('Create');
    expect(createButton).toBeInTheDocument();
  });

  it('opens the menu on button click', async () => {
    const { getByRole, getByText } = renderWithTheme(<CreateMenu />);
    const createButton = getByText('Create');
    await userEvent.click(createButton);
    const menu = getByRole('menu');
    expect(menu).toBeInTheDocument();
  });

  it('renders product family headings', async () => {
    const { getAllByRole, getByText } = renderWithTheme(<CreateMenu />);
    const createButton = getByText('Create');
    await userEvent.click(createButton);
    const headings = getAllByRole('heading', { level: 3 });
    const expectedHeadings = ['Compute', 'Networking', 'Storage', 'Databases'];
    headings.forEach((heading, i) => {
      expect(heading).toHaveTextContent(expectedHeadings[i]);
    });
  });

  it('renders Linode menu item', async () => {
    const { getByText } = renderWithTheme(<CreateMenu />);
    const createButton = getByText('Create');
    await userEvent.click(createButton);
    const menuItem = getByText('Linode');
    expect(menuItem).toBeInTheDocument();
  });

  it('navigates to Linode create page on Linode menu item click', async () => {
    // Create a mock history object
    const history = createMemoryHistory();

    // Render the component with the Router and history
    const { getByText } = renderWithTheme(
      <Router history={history}>
        <CreateMenu />
      </Router>
    );

    const createButton = getByText('Create');
    await userEvent.click(createButton);

    const menuItem = getByText('Linode');
    await userEvent.click(menuItem);

    // Assert that the history's location has changed to the expected URL
    expect(history.location.pathname).toBe('/linodes/create');
  });

  it('does not render hidden menu items', async () => {
    const account = accountFactory.build({
      capabilities: [],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { getByText, queryByText } = renderWithTheme(<CreateMenu />, {
      flags: { databases: false, dbaasV2: { beta: false, enabled: false } },
    });

    const createButton = getByText('Create');
    await userEvent.click(createButton);

    ['Database'].forEach((createMenuItem: string) => {
      const hiddenMenuItem = queryByText(createMenuItem);
      expect(hiddenMenuItem).toBeNull();
    });
  });
});

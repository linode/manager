import * as React from 'react';

import { accountFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { queryClientFactory } from 'src/queries/base';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import PrimaryNav from './PrimaryNav';

const props = {
  closeMenu: vi.fn(),
  isCollapsed: false,
  toggleSpacing: vi.fn(),
  toggleTheme: vi.fn(),
};

const queryClient = queryClientFactory();
const queryString = 'menu-item-Managed';

describe('PrimaryNav', () => {
  it('only contains a "Managed" menu link if the user has Managed services.', async () => {
    server.use(
      http.get('*/account/maintenance', () => {
        return HttpResponse.json({ managed: false });
      })
    );

    const {
      findByTestId,
      getByTestId,
      queryByTestId,
      rerender,
    } = renderWithTheme(<PrimaryNav {...props} />, { queryClient });
    expect(queryByTestId(queryString)).not.toBeInTheDocument();

    server.use(
      http.get('*/account/maintenance', () => {
        return HttpResponse.json({ managed: true });
      })
    );

    rerender(wrapWithTheme(<PrimaryNav {...props} />, { queryClient }));

    await findByTestId(queryString);

    getByTestId(queryString);
  });

  it('should have aria-current attribute for accessible links', () => {
    const { getByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      queryClient,
    });

    expect(getByTestId(queryString).getAttribute('aria-current')).toBe('false');
  });

  it('should show Databases menu item if the user has the account capability', async () => {
    const account = accountFactory.build({
      capabilities: ['Managed Databases'],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { findByText } = renderWithTheme(<PrimaryNav {...props} />);

    const databaseNavItem = await findByText('Databases');

    expect(databaseNavItem).toBeVisible();
  });

  it('should show Monitor menu item if the user has the account capability', async () => {
    const account = accountFactory.build({
      capabilities: ['Akamai Cloud Pulse'],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const flags = {
      aclp: {
        beta: false,
        enabled: true,
      },
    };

    const { findByText } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const monitorNavItem = await findByText('Monitor');

    expect(monitorNavItem).toBeVisible();
  });
});

import * as React from 'react';

import { accountFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { queryClientFactory } from 'src/queries/base';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import PrimaryNav from './PrimaryNav';

import type { Flags } from 'src/featureFlags';
import type { ManagerPreferences } from 'src/types/ManagerPreferences';

const props = {
  closeMenu: vi.fn(),
  desktopMenuToggle: vi.fn(),
  isCollapsed: false,
  toggleSpacing: vi.fn(),
  toggleTheme: vi.fn(),
};

const queryClient = queryClientFactory();
const queryString = 'menu-item-Managed';

describe('PrimaryNav', () => {
  const preference: ManagerPreferences['collapsedSideNavProductFamilies'] = [];

  const queryMocks = vi.hoisted(() => ({
    usePreferences: vi.fn().mockReturnValue({}),
  }));

  vi.mock('src/queries/profile/preferences', async () => {
    const actual = await vi.importActual('src/queries/profile/preferences');
    return {
      ...actual,
      usePreferences: queryMocks.usePreferences,
    };
  });

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

  it('should show Databases menu item if the user has the account capability V1', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    const account = accountFactory.build({
      capabilities: ['Managed Databases'],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const flags: Partial<Flags> = {
      dbaasV2: {
        beta: true,
        enabled: true,
      },
    };

    const { findByTestId, queryByTestId } = renderWithTheme(
      <PrimaryNav {...props} />,
      {
        flags,
      }
    );

    const databaseNavItem = await findByTestId('menu-item-Databases');

    expect(databaseNavItem).toBeVisible();
    expect(queryByTestId('betaChip')).toBeNull();
  });

  it('should show Databases menu item if the user has the account capability V2 Beta', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    const account = accountFactory.build({
      capabilities: ['Managed Databases Beta'],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const flags: Partial<Flags> = {
      dbaasV2: {
        beta: true,
        enabled: true,
      },
    };

    const { findByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const databaseNavItem = await findByTestId('menu-item-Databases');
    const betaChip = await findByTestId('betaChip');

    expect(databaseNavItem).toBeVisible();
    expect(betaChip).toBeVisible();
  });

  it('should show Databases menu item if the user has the account capability V2', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    const account = accountFactory.build({
      capabilities: ['Managed Databases'],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const flags: Partial<Flags> = {
      dbaasV2: {
        beta: false,
        enabled: true,
      },
    };

    const { findByTestId, queryByTestId } = renderWithTheme(
      <PrimaryNav {...props} />,
      {
        flags,
      }
    );

    const databaseNavItem = await findByTestId('menu-item-Databases');

    expect(databaseNavItem).toBeVisible();
    expect(queryByTestId('betaChip')).toBeNull();
  });

  it('should show Databases menu item if the user has the account capability V2', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    const account = accountFactory.build({
      capabilities: ['Managed Databases Beta'],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const flags: Partial<Flags> = {
      dbaasV2: {
        beta: true,
        enabled: true,
      },
    };

    const { findByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags,
    });

    const databaseNavItem = await findByTestId('menu-item-Databases');

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

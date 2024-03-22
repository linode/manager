import * as React from 'react';

import { accountFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
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

  it('should show Databases menu item when feature flag is off but user has Managed Databases', () => {
    const { getByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags: { databases: false },
      queryClient,
    });

    expect(getByTestId('menu-item-Databases')).toBeInTheDocument();
  });

  it('should show databases menu when feature is on', () => {
    const { getByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      flags: { databases: true },
      queryClient,
    });

    expect(getByTestId('menu-item-Databases')).toBeInTheDocument();
  });

  it('should show ACLB if the feature flag is on, but there is not an account capability', async () => {
    const account = accountFactory.build({
      capabilities: [],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { findByText } = renderWithTheme(<PrimaryNav {...props} />, {
      flags: { aclb: true },
    });

    const loadbalancerNavItem = await findByText('Cloud Load Balancers');

    expect(loadbalancerNavItem).toBeVisible();
  });

  it('should show ACLB if the feature flag is off, but the account has the capability', async () => {
    const account = accountFactory.build({
      capabilities: ['Akamai Cloud Load Balancer'],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { findByText } = renderWithTheme(<PrimaryNav {...props} />, {
      flags: { aclb: false },
    });

    const loadbalancerNavItem = await findByText('Cloud Load Balancers');

    expect(loadbalancerNavItem).toBeVisible();
  });

  it('should not show ACLB if the feature flag is off and there is no account capability', async () => {
    const account = accountFactory.build({
      capabilities: [],
    });

    server.use(
      http.get('*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { queryByText } = renderWithTheme(<PrimaryNav {...props} />, {
      flags: { aclb: false },
    });

    expect(queryByText('Cloud Load Balancers')).not.toBeInTheDocument();
  });
});

import * as React from 'react';

import { rest, server } from 'src/mocks/testServer';
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
      rest.get('*/account/maintenance', (req, res, ctx) => {
        return res(ctx.json({ managed: false }));
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
      rest.get('*/account/maintenance', (req, res, ctx) => {
        return res(ctx.json({ managed: true }));
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
});

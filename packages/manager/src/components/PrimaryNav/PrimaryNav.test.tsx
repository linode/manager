import * as React from 'react';
import { rest, server } from 'src/mocks/testServer';
import { queryClientFactory } from 'src/queries/base';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';
import PrimaryNav from './PrimaryNav';

const props = {
  closeMenu: jest.fn(),
  toggleTheme: jest.fn(),
  toggleSpacing: jest.fn(),
  isCollapsed: false,
};

const queryClient = queryClientFactory();

describe('PrimaryNav', () => {
  it('only contains a "Managed" menu link if the user has Managed services.', async () => {
    server.use(
      rest.get('*/account/maintenance', (req, res, ctx) => {
        return res(ctx.json({ managed: false }));
      })
    );

    const { getByTestId, rerender, queryByTestId, findByTestId } =
      renderWithTheme(<PrimaryNav {...props} />, { queryClient });
    expect(queryByTestId('menu-item-Managed')).not.toBeInTheDocument();

    server.use(
      rest.get('*/account/maintenance', (req, res, ctx) => {
        return res(ctx.json({ managed: true }));
      })
    );

    rerender(wrapWithTheme(<PrimaryNav {...props} />, { queryClient }));

    await findByTestId('menu-item-Managed');

    getByTestId('menu-item-Managed');
  });

  it('should have aria-current attribute for accessible links', () => {
    const { getByTestId } = renderWithTheme(<PrimaryNav {...props} />, {
      queryClient,
    });

    expect(getByTestId('menu-item-Managed').getAttribute('aria-current')).toBe(
      'false'
    );
  });
});

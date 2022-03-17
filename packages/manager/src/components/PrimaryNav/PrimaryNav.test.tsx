import * as React from 'react';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';
import PrimaryNav from './PrimaryNav';

const props = {
  closeMenu: jest.fn(),
  toggleTheme: jest.fn(),
  toggleSpacing: jest.fn(),
  isCollapsed: false,
};

describe('PrimaryNav', () => {
  it('only contains a "Managed" menu link if the user has Managed services.', async () => {
    server.use(
      rest.get('*/account/maintenance', (req, res, ctx) => {
        return res(ctx.json({ managed: false }));
      })
    );

    const {
      getByTestId,
      rerender,
      queryByTestId,
      findByTestId,
    } = renderWithTheme(<PrimaryNav {...props} />);
    expect(queryByTestId('menu-item-Managed')).not.toBeInTheDocument();

    server.use(
      rest.get('*/account/maintenance', (req, res, ctx) => {
        return res(ctx.json({ managed: true }));
      })
    );

    rerender(wrapWithTheme(<PrimaryNav {...props} />));

    await findByTestId('menu-item-Managed');

    getByTestId('menu-item-Managed');
  });
});

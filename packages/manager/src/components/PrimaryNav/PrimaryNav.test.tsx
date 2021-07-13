import { waitFor } from '@testing-library/react';
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

    const { getByTestId, rerender, queryByTestId } = renderWithTheme(
      <PrimaryNav {...props} />
    );
    expect(queryByTestId('menu-item-Managed')).not.toBeInTheDocument();

    server.use(
      rest.get('*/account/maintenance', (req, res, ctx) => {
        return res(ctx.json({ managed: true }));
      })
    );

    rerender(wrapWithTheme(<PrimaryNav {...props} />));

    await waitFor(() => getByTestId('menu-item-Managed'));

    getByTestId('menu-item-Managed');
  });

  it('only contains a "Firewalls" menu link when the flag is enabled', () => {
    const { getByTestId, rerender, queryByTestId } = renderWithTheme(
      <PrimaryNav {...props} />,
      {
        flags: { firewalls: false },
      }
    );
    expect(queryByTestId('menu-item-Firewalls')).not.toBeInTheDocument();

    rerender(
      wrapWithTheme(<PrimaryNav {...props} />, {
        flags: { firewalls: true },
      })
    );

    getByTestId('menu-item-Firewalls');
  });
});

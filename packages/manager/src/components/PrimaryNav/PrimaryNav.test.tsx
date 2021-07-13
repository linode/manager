import * as React from 'react';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';
import PrimaryNav from './PrimaryNav';

const props = {
  closeMenu: jest.fn(),
  toggleTheme: jest.fn(),
  toggleSpacing: jest.fn(),
  isCollapsed: false,
};

describe('PrimaryNav', () => {
  it.skip('only contains a "Managed" menu link if the user has Managed services.', () => {
    const { getByTestId, rerender, queryByTestId } = renderWithTheme(
      <PrimaryNav {...props} />
    );
    expect(queryByTestId('menu-item-Managed')).not.toBeInTheDocument();

    rerender(wrapWithTheme(<PrimaryNav {...props} />));

    getByTestId('menu-item-Managed');
  });

  it.skip('only contains a "Firewalls" menu link when the flag is enabled', () => {
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

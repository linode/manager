import * as React from 'react';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';
import { withManaged, withoutManaged } from 'src/utilities/testHelpersStore';
import PrimaryNav_CMR from './PrimaryNav_CMR';

const props = {
  closeMenu: jest.fn(),
  toggleTheme: jest.fn(),
  toggleSpacing: jest.fn(),
  isCollapsed: false
};

describe('PrimaryNav_CMR', () => {
  it('only contains a "Managed" menu link if the user has Managed services.', () => {
    const { getByTestId, rerender, queryByTestId } = renderWithTheme(
      <PrimaryNav_CMR {...props} />,
      {
        customStore: withoutManaged
      }
    );
    expect(queryByTestId('menu-item-Managed')).not.toBeInTheDocument();

    rerender(
      wrapWithTheme(<PrimaryNav_CMR {...props} />, {
        customStore: withManaged
      })
    );

    getByTestId('menu-item-Managed');
  });

  it('only contains a "Firewalls" menu link when the flag is enabled', () => {
    const { getByTestId, rerender, queryByTestId } = renderWithTheme(
      <PrimaryNav_CMR {...props} />,
      {
        flags: { firewalls: false }
      }
    );
    expect(queryByTestId('menu-item-Firewalls')).not.toBeInTheDocument();

    rerender(
      wrapWithTheme(<PrimaryNav_CMR {...props} />, {
        flags: { firewalls: true }
      })
    );

    getByTestId('menu-item-Firewalls');
  });
});

import { cleanup } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';
import { withManaged, withoutManaged } from 'src/utilities/testHelpersStore';
import PrimaryNav_CMR, { PrimaryNavProps } from './PrimaryNav_CMR';

afterEach(cleanup);

const props: PrimaryNavProps = {
  closeMenu: jest.fn(),
  toggleSpacing: jest.fn(),
  toggleTheme: jest.fn(),
  isCollapsed: false
};

describe('PrimaryNav_CMR', () => {
  it('contains all nav groups', () => {
    const { getByTestId } = renderWithTheme(<PrimaryNav_CMR {...props} />);
    getByTestId('nav-group-Compute');
    getByTestId('nav-group-Network');
    getByTestId('nav-group-Storage');
    getByTestId('nav-group-Monitors');
  });

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

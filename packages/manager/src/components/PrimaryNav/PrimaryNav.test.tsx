import { render } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';
import PrimaryNav, { Props } from './PrimaryNav';
import useFlags from 'src/hooks/useFlags';

jest.mock('src/hooks/useFlags', () => ({
  default: jest.fn().mockReturnValue({})
}));

const mockCloseMenu = jest.fn();
const mockToggleSpacing = jest.fn();
const mockToggleTheme = jest.fn();

const props: Props = {
  closeMenu: mockCloseMenu,
  isCollapsed: false,
  toggleSpacing: mockToggleSpacing,
  toggleTheme: mockToggleTheme
};

describe('PrimaryNav', () => {
  it('includes all unhidden links', () => {
    const { getByText } = renderWithTheme(<PrimaryNav {...props} />);
    [
      'Dashboard',
      'Linodes',
      'Volumes',
      'Object Storage',
      'NodeBalancers',
      'Domains',
      'Marketplace',
      'Longview',
      'Kubernetes',
      'StackScripts',
      'Images',
      'Get Help'
    ].forEach(link => {
      getByText(link);
    });
  });

  it('includes "Firewalls" link only when flag is on', () => {
    const { findByText } = renderWithTheme(<PrimaryNav {...props} />);

    expect(findByText('Firewalls')).resolves.not.toBeInTheDocument();

    (useFlags as any).mockReturnValue({
      firewalls: true
    });

    const { getByText } = renderWithTheme(<PrimaryNav {...props} />);
    getByText('Firewalls');
  });

  it('includes "Managed" link only when the account is Managed', () => {
    const { findByText, rerender, getByText } = render(
      wrapWithTheme(<PrimaryNav {...props} />)
    );

    expect(findByText('Managed')).resolves.not.toBeInTheDocument();

    rerender(
      wrapWithTheme(<PrimaryNav {...props} />, {
        customStore: {
          __resources: {
            accountSettings: {
              data: { managed: true } as any
            }
          }
        }
      })
    );

    getByText('Managed');
  });

  it('includes "Account" link only when the user has account access', () => {
    const { findByText, getByText, rerender } = render(
      wrapWithTheme(<PrimaryNav {...props} />)
    );

    expect(findByText('Account')).resolves.not.toBeInTheDocument();

    rerender(
      wrapWithTheme(<PrimaryNav {...props} />, {
        customStore: {
          __resources: {
            profile: {
              data: { restricted: false } as any
            },
            account: {
              lastUpdated: 1
            }
          }
        }
      })
    );

    getByText('Account');
  });
});

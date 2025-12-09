import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { IPAddress, sortIPAddress } from './IPAddress';

import type { ManagerPreferences } from '@linode/utilities';

const publicIP = '8.8.8.8';
const publicIP2 = '45.45.45.45';
const privateIP = '192.168.220.103';
const privateIP2 = '192.168.220.102';

describe('IPAddress', () => {
  it('should display one IP address if showAll is false', () => {
    const { container, getByText } = renderWithTheme(
      <IPAddress ips={['8.8.8.8', '8.8.4.4']} showAll={false} showMore={true} />
    );

    // first IP address should be visible
    expect(getByText('8.8.8.8')).toBeVisible();

    // Show more button should be visible
    expect(container.querySelector('[data-qa-show-more-chip]')).toBeVisible();
  });

  it('should not display ShowMore button unless the showMore prop is true', () => {
    const { container, getByText } = renderWithTheme(
      <IPAddress
        ips={['8.8.8.8', '8.8.4.4']}
        showAll={false}
        showMore={false}
      />
    );

    // first IP address should be visible
    expect(getByText('8.8.8.8')).toBeVisible();

    // Show more button should not be visible
    expect(container.querySelector('[data-qa-show-more-chip]')).toBeNull();
  });

  it('should render the copy icon if showTooltipOnIpHover is false', () => {
    const { container } = renderWithTheme(
      <IPAddress
        ips={['8.8.8.8', '8.8.4.4']}
        showAll={false}
        showMore={false}
        showTooltipOnIpHover={false}
      />
    );

    expect(container.querySelector('[data-qa-copy-ip-text]')).toBeVisible();
  });

  it('should disable copy functionality if disabled is true', () => {
    const { container } = renderWithTheme(
      <IPAddress
        disabled={true}
        ips={['8.8.8.8', '8.8.4.4']}
        showAll={false}
        showMore={false}
        showTooltipOnIpHover={false}
      />
    );

    expect(container.querySelector('[data-qa-copy-ip-text]')).toBeDisabled();
  });
});

describe('IP address sorting', () => {
  it('should place private IPs after public IPs', () => {
    expect([publicIP, privateIP].sort(sortIPAddress)).toEqual([
      publicIP,
      privateIP,
    ]);
    expect([privateIP, publicIP].sort(sortIPAddress)).toEqual([
      publicIP,
      privateIP,
    ]);
  });
  it('should not change order of two addresses of the same type', () => {
    expect([publicIP, publicIP2].sort(sortIPAddress)).toEqual([
      publicIP,
      publicIP2,
    ]);
    expect([privateIP, privateIP2].sort(sortIPAddress)).toEqual([
      privateIP,
      privateIP2,
    ]);
  });
  it('should sort longer lists correctly', () => {
    expect(
      [publicIP, privateIP, publicIP2, privateIP2].sort(sortIPAddress)
    ).toEqual([publicIP, publicIP2, privateIP, privateIP2]);
    expect(
      [privateIP, publicIP, publicIP2, privateIP2].sort(sortIPAddress)
    ).toEqual([publicIP, publicIP2, privateIP, privateIP2]);
  });
});

describe('IPAddress masked', () => {
  const preferences: ManagerPreferences = {
    maskSensitiveData: true,
  };

  const queryMocks = vi.hoisted(() => ({
    usePreferences: vi.fn().mockReturnValue({}),
  }));

  vi.mock('@linode/queries', async () => {
    const actual = await vi.importActual('@linode/queries');
    return {
      ...actual,
      usePreferences: queryMocks.usePreferences,
    };
  });

  it('should mask all shown IP addresses if the maskSensitiveData preference is enabled', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preferences,
    });

    const { getAllByTestId, getAllByText, getByText } = renderWithTheme(
      <IPAddress
        ips={['8.8.8.8', '8.8.40.4']}
        showAll={true}
        showMore={false}
      />
    );

    const visibilityToggles = getAllByTestId('VisibilityTooltip');

    // First IP address should be masked
    expect(getAllByText('•••••••••••••••')[0]).toBeVisible();

    await userEvent.click(visibilityToggles[0]);

    // First IP address should be unmasked; second IP address should still be masked
    expect(getByText('8.8.8.8')).toBeVisible();
    expect(getByText('•••••••••••••••')).toBeVisible();

    await userEvent.click(visibilityToggles[1]);

    // Second IP address should be unmasked
    expect(getByText('8.8.40.4')).toBeVisible();
  });

  it('should mask IP addresses if the maskSensitiveData preference is enabled and showMore is enabled', async () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preferences,
    });

    const { container, getAllByTestId, getAllByText, getByText, queryByText } =
      renderWithTheme(
        <IPAddress
          ips={['8.8.8.8', '8.8.40.4']}
          showAll={false}
          showMore={true}
        />
      );

    const visibilityToggles = getAllByTestId('VisibilityTooltip');

    // First IP address should be masked but visible
    expect(getAllByText('•••••••••••••••')[0]).toBeVisible();

    await userEvent.click(visibilityToggles[0]);

    // First IP address should be unmasked
    expect(getByText('8.8.8.8')).toBeVisible();

    // Show more button should be visible
    expect(queryByText('8.8.40.4')).toBeNull();
    expect(
      container.querySelector('[data-qa-show-more-chip]')
    ).toBeInTheDocument();
  });
});

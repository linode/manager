import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { IPAddress, sortIPAddress } from './IPAddress';

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

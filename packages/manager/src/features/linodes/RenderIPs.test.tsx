import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import RenderIPs from './RenderIPs';

const ipv4Addresses = [
  '45.00.00.100',
  '45.00.00.101',
  '45.00.00.102',
  '45.00.00.103',
  '45.00.00.104',
  '45.00.00.105',
  '45.00.00.106',
  '45.00.00.107'
];

const ipv6 = '2600:0x00::f00x:00xx:xx00:0x00/64';

describe('Rendered Linode IPs', () => {
  it('renders every IP address without truncation if there are 4 or fewer', () => {
    const { queryByText, queryAllByTestId } = renderWithTheme(
      <RenderIPs ipv4={ipv4Addresses.slice(0, 4)} ipv6={ipv6} linodeId={1} />
    );

    expect(queryAllByTestId('ipv4-list-item')).toHaveLength(4);
    expect(queryByText('1 more')).not.toBeInTheDocument();
  });

  it('renders 3 IP addresses and truncates the rest if there are more than 4', () => {
    const { getByText, queryAllByTestId } = renderWithTheme(
      <RenderIPs ipv4={ipv4Addresses} ipv6={ipv6} linodeId={2} />
    );

    const numOfTruncatedIPs = ipv4Addresses.length - 3;

    expect(queryAllByTestId('ipv4-list-item')).toHaveLength(3);
    expect(queryAllByTestId('truncated-ips')).toHaveLength(1); // Make sure only one link is rendered.
    expect(getByText(`${numOfTruncatedIPs} more`)).toBeInTheDocument();
  });
});

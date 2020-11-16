import * as React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { renderIPs } from './LinodeEntityDetail';

const ipAddresses = [
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

describe('Rendered IPs in LinodeEntityDetail', () => {
  it('renders every IP address without truncation if there are 4 or fewer', () => {
    const { queryByTestId } = render(
      <MemoryRouter>
        <div data-testid="test-ips">
          {renderIPs(ipAddresses.slice(0, 3), ipv6, 1)}
        </div>
      </MemoryRouter>
    );

    const container = queryByTestId('test-ips');
  });
});

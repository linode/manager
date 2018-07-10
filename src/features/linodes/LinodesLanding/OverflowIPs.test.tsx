import { mount } from 'enzyme';
import * as React from 'react';

import OverflowIPs from './OverflowIPs';

describe('OverflowIPs', () => {
  it('should render without error and display the number of IPs', () => {
    const result = mount(
      <OverflowIPs
        ips={['8.8.8.8']}
      />,
    );
    const rendered = result.find('OverflowIPs');
    const numberText = result.find('span').text();

    expect(rendered).toHaveLength(1);
    expect(numberText).toBe('+1');
  });

  it('should render each IPAddress when the chip is clicked', () => {
    const result = mount(
      <OverflowIPs
        ips={['8.8.8.8', '8.8.4.4', '192.168.100.112']}
      />,
    );
    const chip = result.find('Chip');
    chip.simulate('click');
    const ipAddresses = result.find('IPAddress');

    expect(ipAddresses).toHaveLength(3);
  });
});

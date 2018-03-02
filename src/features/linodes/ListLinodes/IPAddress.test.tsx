import * as React from 'react';
import { mount } from 'enzyme';
import IPAddress from './IPAddress';

describe('IPAddress', () => {
  it('should render without error and display and IP address', () => {
    const result = mount(
      <IPAddress
        ips={['8.8.8.8']}
      />,
    );
    const rendered = result.find('IPAddress');
    const ipText = result.find('Typography').text();

    expect(rendered).toHaveLength(1);
    expect(ipText).toBe('8.8.8.8');
  });

  it('should render an Overflow component with more than 1 address', () => {
    const result = mount(
      <IPAddress
        ips={['8.8.8.8', '8.8.4.4']}
      />,
    );
    const overflow = result.find('OverflowIPs');

    expect(overflow).toHaveLength(1);
  });

  it('should render only one icon', () => {
    const result = mount(
      <IPAddress
        ips={['8.8.8.8', '8.8.4.4']}
      />,
    );
    const icon = result.find('SvgIcon');

    expect(icon).toHaveLength(1);
  });
});

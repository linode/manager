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
    const ipText = result.find('.ip').text();

    expect(rendered).toHaveLength(1);
    expect(ipText).toBe('8.8.8.8');
  });

  it('should render ShowMore with props.items = IPs', () => {
    const result = mount(
      <IPAddress
        ips={['8.8.8.8', '8.8.4.4']}
      />,
    );
    const showmore = result.find('ShowMore');

    expect(showmore.exists()).toBe(true);
    expect(showmore.prop('items')).toEqual(['8.8.4.4']);
  });
});

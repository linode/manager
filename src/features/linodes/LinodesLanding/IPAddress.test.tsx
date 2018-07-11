import { mount } from 'enzyme';
import * as React from 'react';

import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

import IPAddress from './IPAddress';

describe('IPAddress', () => {
  it('should render without error and display and IP address', () => {
    const result = mount(
      <LinodeThemeWrapper>
        <IPAddress
          ips={['8.8.8.8']}
        />
      </LinodeThemeWrapper>,
    );

    const rendered = result.find('IPAddress');
    const ipText = result.find('.ip').text();

    expect(rendered).toHaveLength(1);
    expect(ipText).toBe('8.8.8.8');
  });

  it('should render ShowMore with props.items = IPs', () => {
    const result = mount(
      <LinodeThemeWrapper>
        <IPAddress
          ips={['8.8.8.8', '8.8.4.4']}
        />
      </LinodeThemeWrapper>,
    );
    const showmore = result.find('ShowMore');

    expect(showmore.exists()).toBe(true);
    expect(showmore.prop('items')).toEqual(['8.8.4.4']);
  });
});

import { mount } from 'enzyme';
import * as React from 'react';

import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

import IPAddress, { sortIPAddress } from './IPAddress';

const publicIP = '8.8.8.8';
const publicIP2 = '45.45.45.45';
const privateIP = '192.168.220.103';
const privateIP2 = '192.168.220.102';

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
          showMore
        />
      </LinodeThemeWrapper>,
    );
    const showmore = result.find('ShowMore');

    expect(showmore.exists()).toBe(true);
    expect(showmore.prop('items')).toEqual(['8.8.4.4']);
  });

  describe("IP address sorting", () => {
    it("should place private IPs after public IPs", () => {
      expect([publicIP, privateIP].sort(sortIPAddress)).toEqual([publicIP, privateIP]);
      expect([privateIP, publicIP].sort(sortIPAddress)).toEqual([publicIP, privateIP])
    });
    it("should not change order of two addresses of the same type", () => {
      expect([publicIP, publicIP2].sort(sortIPAddress)).toEqual([publicIP, publicIP2]);
      expect([privateIP, privateIP2].sort(sortIPAddress)).toEqual([privateIP, privateIP2]);
    });
    it("should sort longer lists correctly", () => {
      expect([publicIP, privateIP, publicIP2, privateIP2].sort(sortIPAddress))
        .toEqual([publicIP, publicIP2, privateIP, privateIP2]);
      expect([privateIP, publicIP, publicIP2, privateIP2].sort(sortIPAddress))
        .toEqual([publicIP, publicIP2, privateIP, privateIP2]);
    });
  });
});

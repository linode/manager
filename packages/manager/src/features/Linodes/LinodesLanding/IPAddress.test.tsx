import { shallow } from 'enzyme';
import * as React from 'react';

import { IPAddress, sortIPAddress } from './IPAddress';

const publicIP = '8.8.8.8';
const publicIP2 = '45.45.45.45';
const privateIP = '192.168.220.103';
const privateIP2 = '192.168.220.102';

const component = shallow(<IPAddress ips={['8.8.8.8', '8.8.4.4']} />);

describe('IPAddress', () => {
  it('should render without error and display one IP address if showAll is false', () => {
    component.setProps({ showAll: false, showMore: true });
    const rendered = component.find('[data-qa-copy-ip-text]');

    expect(rendered).toHaveLength(1);
    expect(rendered.prop('text')).toEqual('8.8.8.8');
  });

  it('should not display ShowMore button unless the showMore prop is true', () => {
    component.setProps({ showAll: false, showMore: false });
    expect(component.find('[data-qa-ip-more]')).toHaveLength(0);
  });

  it('should render ShowMore with props.items = IPs', () => {
    component.setProps({ showMore: true });
    const showmore = component.find('[data-qa-ip-more]');
    expect(showmore.exists()).toBe(true);
    expect(showmore.prop('items')).toEqual(['8.8.4.4']);
  });

  // TODO figure out this test !!!!!!!
  it('should render the copy icon, but not show it if showTooltipOnIpHover is false', () => {
    const icon = component.find('[data-testid]');
    expect(icon).toHaveLength(1);
    expect(icon.get(0).props.isIpHovered).toBe(false);
    expect(icon.get(0).props.showTooltipOnIpHover).toBe(false);

    component.setProps({ showTooltipOnIpHover: true });
    const copy = component.find('[data-qa-copy-ip]');
    expect(copy).toHaveLength(1);
    const icon2 = component.find('[data-testid]');
    expect(icon2.get(0).props.showTooltipOnIpHover).toBe(true);
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

  it('should disable copy functionality if disabled is true', () => {
    component.setProps({ disabled: true });
    const copyTooltip = component.find('[data-qa-copy-ip-text]');
    expect(copyTooltip.prop('disabled')).toBe(true);
  });
});

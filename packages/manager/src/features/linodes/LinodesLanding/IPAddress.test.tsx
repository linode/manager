import { shallow } from 'enzyme';
import * as React from 'react';

import { IPAddress, sortIPAddress } from './IPAddress';

const publicIP = '8.8.8.8';
const publicIP2 = '45.45.45.45';
const privateIP = '192.168.220.103';
const privateIP2 = '192.168.220.102';

const classes = {
  root: '',
  left: '',
  right: '',
  icon: '',
  row: '',
  multipleAddresses: '',
  ip: '',
  ipLink: '',
  hide: 'hide'
};

const component = shallow(
  <IPAddress classes={classes} ips={['8.8.8.8', '8.8.4.4']} />
);

describe('IPAddress', () => {
  it('should render without error and display one IP address if showAll is false', () => {
    component.setProps({ showMore: true, showAll: false });
    const rendered = component.find('[data-qa-ip-main]');
    const ipText = rendered.text();

    expect(rendered).toHaveLength(1);
    expect(ipText).toBe('8.8.8.8');
  });

  it('should not display ShowMore button unless the showMore prop is true', () => {
    component.setProps({ showMore: false, showAll: false });
    expect(component.find('[data-qa-ip-more]')).toHaveLength(0);
  });

  it('should render ShowMore with props.items = IPs', () => {
    component.setProps({ showMore: true });
    const showmore = component.find('[data-qa-ip-more]');
    expect(showmore.exists()).toBe(true);
    expect(showmore.prop('items')).toEqual(['8.8.4.4']);
  });

  it('should show the copy icon if copyRight is true', () => {
    expect(component.find('[data-qa-copy-ip]')).toHaveLength(0);
    component.setProps({ copyRight: true });
    expect(component.find('[data-qa-copy-ip]')).toHaveLength(1);
  });

  it('should render the copyIcon, but not show it, if copyRight is true and showCopyOnHover is true', () => {
    expect(component.find('.hide')).toHaveLength(0);
    component.setProps({ copyRight: true, showCopyOnHover: true });
    const copy = component.find('[data-qa-copy-ip]');
    expect(copy).toHaveLength(1);
    expect(component.find('.hide')).toHaveLength(1);
  });

  describe('IP address sorting', () => {
    it('should place private IPs after public IPs', () => {
      expect([publicIP, privateIP].sort(sortIPAddress)).toEqual([
        publicIP,
        privateIP
      ]);
      expect([privateIP, publicIP].sort(sortIPAddress)).toEqual([
        publicIP,
        privateIP
      ]);
    });
    it('should not change order of two addresses of the same type', () => {
      expect([publicIP, publicIP2].sort(sortIPAddress)).toEqual([
        publicIP,
        publicIP2
      ]);
      expect([privateIP, privateIP2].sort(sortIPAddress)).toEqual([
        privateIP,
        privateIP2
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
});

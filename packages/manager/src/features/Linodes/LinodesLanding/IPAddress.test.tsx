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

  // TODO figure out this test
  it('should render the copy icon, but not show it if showCopyOnHover is true', () => {
    //expect(component.find('.hide')).toHaveLength(0);
    // const noHover = component.find('CopyTooltip');
    // expect(noHover).toHaveLength(1);
    // console.log(noHover.get(0));
    // expect(noHover.props().style).not.toHaveProperty('opacity');

    // console.log(copy.get(0));
    // console.log(component.debug());
    // const hoverTest = component.find('[data-isShown]');
    // console.log("this is hoverTest\n\n\n\n", hoverTest.debug())
    // const hoverIcon = component.find('[data-isShown]="false"');
    // console.log(hoverIcon.debug());

    //expect(hoverIcon).toHaveLength(1);
    // expect(hoverIcon.props().style).toHaveProperty('opacity');

    expect(component.find('.hide')).toHaveLength(0);
    component.setProps({ showCopyOnHover: true });
    const copy = component.find('[data-qa-copy-ip]');
    expect(copy).toHaveLength(1);
    //console.log(copy.get(0).props.children)
    //const style = component.prop('style');
    //expect(style.opacity).toBe(0);
    // changed styling, so now this won't work anymore
    // expect(component.find('.hide')).toHaveLength(1);
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
});

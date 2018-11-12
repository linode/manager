import { shallow } from 'enzyme';
import * as React from 'react';
import { AccountNavigation } from './AccountNavigation';

describe('AccountNavigation', () => {
  const mockClasses = {
    activeLink: '',
    arrow: '',
    collapsible: '',
    linkItem: '',
    listItem: '',
    listItemAccount: '',
    sublink: '',
    sublinkActive: '',
    sublinkPanel: '',
  };

  describe('when user does not have account access', () => {
    it('should render null', () => {
      const wrapper = shallow(
        <AccountNavigation
          closeMenu={jest.fn()}
          expandedMenus={{}}
          expandMenutItem={jest.fn()}
          linkIsActive={jest.fn()}
          classes={mockClasses}
          hasAccountAccess={false}
        />
      );

      expect(wrapper.type()).toBeNull();
    });
  });

  describe('when user has account access', () => {
    it('should render', () => {
      const wrapper = shallow(
        <AccountNavigation
          closeMenu={jest.fn()}
          expandedMenus={{}}
          expandMenutItem={jest.fn()}
          linkIsActive={jest.fn()}
          classes={mockClasses}
          hasAccountAccess={true}
        />
      );

      expect(wrapper.type()).not.toBeNull();
    });
  });
});

import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { PrimaryNav } from './PrimaryNav';

const findLinkIn = (w: ShallowWrapper) => (s: string) => {
  return w.find(`WithStyles(ListItem)[data-qa-nav-item="${s}"]`);
};
const mockClasses = {
  active: '',
  activeLink: '',
  arrow: '',
  collapsible: '',
  divider: '',
  fadeContainer: '',
  linkItem: '',
  listItem: '',
  listItemAccount: '',
  logoItem: '',
  menuGrid: '',
  spacer: '',
  sublink: '',
  sublinkActive: '',
  sublinkPanel: '',
};

describe('PrimaryNav', () => {
  describe('default', () => {
    let wrapper;
    let findLinkInPrimaryNav: Function;

    beforeAll(() => {
      wrapper = shallow(
        <PrimaryNav
          classes={mockClasses}
          closeMenu={jest.fn()}
          toggleTheme={jest.fn()}
          hasAccountAccess={false}
          isManagedAccount={false}
          {...reactRouterProps}
        />
      );

      findLinkInPrimaryNav = findLinkIn(wrapper);
    });

    it('should have a dashboard link', () => {
      expect(findLinkInPrimaryNav('dashboard')).toHaveLength(1);
    });

    it('should have a linodes link', () => {
      expect(findLinkInPrimaryNav('linodes')).toHaveLength(1);
    });

    it('should have a volumes link', () => {
      expect(findLinkInPrimaryNav('volumes')).toHaveLength(1);
    });

    it('should have a nodebalancers link', () => {
      expect(findLinkInPrimaryNav('nodebalancers')).toHaveLength(1);
    });

    it('should have a domains link', () => {
      expect(findLinkInPrimaryNav('domains')).toHaveLength(1);
    });

    it('should have a longview link', () => {
      expect(findLinkInPrimaryNav('longview')).toHaveLength(1);
    });

    it('should have a stackscripts link', () => {
      expect(findLinkInPrimaryNav('stackscripts')).toHaveLength(1);
    });

    it('should have a images link', () => {
      expect(findLinkInPrimaryNav('images')).toHaveLength(1);
    });

    it('should have a get help link', () => {
      expect(findLinkInPrimaryNav('support')).toHaveLength(1);
    });

    it('should not have a account link', () => {
      expect(findLinkInPrimaryNav('account')).toHaveLength(0);
    });

    it('should note have a managed link', () => {
      expect(findLinkInPrimaryNav('managed')).toHaveLength(0);
    });
  });

  describe('when user has account access', () => {
    let wrapper;
    let findLinkInPrimaryNav: Function;

    beforeAll(() => {
      wrapper = shallow(
        <PrimaryNav
          classes={mockClasses}
          closeMenu={jest.fn()}
          toggleTheme={jest.fn()}
          hasAccountAccess={true}
          isManagedAccount={false}
          {...reactRouterProps}
        />
      );

      findLinkInPrimaryNav = findLinkIn(wrapper);
    });

    it('should have a account link', () => {
      expect(findLinkInPrimaryNav('account')).toHaveLength(1);
    });
  });

  describe('when account is managed', () => {
    let wrapper;
    let findLinkInPrimaryNav: Function;

    beforeAll(() => {
      wrapper = shallow(
        <PrimaryNav
          classes={mockClasses}
          closeMenu={jest.fn()}
          toggleTheme={jest.fn()}
          hasAccountAccess={false}
          isManagedAccount={true}
          {...reactRouterProps}
        />
      );

      findLinkInPrimaryNav = findLinkIn(wrapper);
    });

    it('should have a managed link', () => {
      expect(findLinkInPrimaryNav('managed')).toHaveLength(1);
    });
  });
});

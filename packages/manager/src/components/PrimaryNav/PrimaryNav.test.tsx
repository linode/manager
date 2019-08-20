import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import ldClient from 'src/__data__/ldClient';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { light } from 'src/themes';
import { ClassNames, PrimaryNav } from './PrimaryNav';

const findLinkIn = (w: ShallowWrapper) => (s: string) => {
  return w.find(`[data-qa-nav-item="${s}"]`);
};
const mockClasses: Record<ClassNames, string> = {
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
  logoItemCompact: '',
  menuGrid: '',
  spacer: '',
  sublink: '',
  sublinkActive: '',
  sublinkPanel: '',
  settings: '',
  settingsBackdrop: '',
  activeSettings: '',
  menu: '',
  paper: ''
};

describe('PrimaryNav', () => {
  describe('default', () => {
    let wrapper;
    let findLinkInPrimaryNav: Function;

    beforeAll(() => {
      wrapper = shallow(
        <PrimaryNav
          classes={mockClasses}
          theme={light({
            spacingOverride: 4
          })}
          toggleSpacing={jest.fn()}
          closeMenu={jest.fn()}
          flags={{}}
          ldClient={ldClient}
          toggleTheme={jest.fn()}
          hasAccountAccess={false}
          accountCapabilities={[]}
          accountLastUpdated={0}
          isManagedAccount={true}
          flags={{}}
          ldClient={{}}
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

    it('should not have a account link', () => {
      expect(findLinkInPrimaryNav('account')).toHaveLength(0);
    });

    it('should have a managed link', () => {
      expect(findLinkInPrimaryNav('managed')).toHaveLength(1);
    });
  });

  describe('when user has account access', () => {
    let wrapper;
    let findLinkInPrimaryNav: Function;

    beforeAll(() => {
      wrapper = shallow(
        <PrimaryNav
          classes={mockClasses}
          theme={light({
            spacingOverride: 4
          })}
          toggleSpacing={jest.fn()}
          closeMenu={jest.fn()}
          flags={{}}
          ldClient={ldClient}
          toggleTheme={jest.fn()}
          hasAccountAccess={true}
          accountCapabilities={[]}
          accountLastUpdated={0}
          isManagedAccount={true}
          flags={{}}
          ldClient={{}}
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
          theme={light({
            spacingOverride: 4
          })}
          toggleSpacing={jest.fn()}
          closeMenu={jest.fn()}
          flags={{}}
          ldClient={ldClient}
          toggleTheme={jest.fn()}
          hasAccountAccess={false}
          accountCapabilities={[]}
          accountLastUpdated={0}
          isManagedAccount={true}
          flags={{}}
          ldClient={{}}
          {...reactRouterProps}
        />
      );

      findLinkInPrimaryNav = findLinkIn(wrapper);
    });

    it('should have a managed link', () => {
      expect(findLinkInPrimaryNav('managed')).toHaveLength(1);
    });
  });

  describe('when customer has OBJ access', () => {
    let wrapper;
    let findLinkInPrimaryNav: Function;

    beforeAll(() => {
      wrapper = shallow(
        <PrimaryNav
          classes={mockClasses}
          theme={light({
            spacingOverride: 4
          })}
          toggleSpacing={jest.fn()}
          closeMenu={jest.fn()}
          flags={{}}
          ldClient={ldClient}
          toggleTheme={jest.fn()}
          hasAccountAccess={false}
          accountCapabilities={[
            'Linodes',
            'NodeBalancers',
            'Block Storage',
            'Object Storage'
          ]}
          accountLastUpdated={0}
          isManagedAccount={true}
          flags={{}}
          ldClient={{}}
          {...reactRouterProps}
        />
      );

      findLinkInPrimaryNav = findLinkIn(wrapper);
    });

    it('should have an object storage link', () => {
      expect(findLinkInPrimaryNav('object-storage')).toHaveLength(1);
    });
  });
});

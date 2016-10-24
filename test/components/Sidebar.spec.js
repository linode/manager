import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import Sidebar from '../../src/components/Sidebar';
import { LOGIN_ROOT } from '~/constants';

const defaultLinks = [
  ['services', [
    { icon: 'cubes', name: 'Linodes', link: '/linodes' },
    { icon: 'code-fork', name: 'NodeBalancers', link: '/nodebalancers' },
    { icon: 'bar-chart-o', name: 'Longview', link: '/longview' },
    { icon: 'share-alt', name: 'DNS Manager', link: '/dnszones' },
  ]],
  ['account', [
    { icon: 'user', name: 'My profile', link: `${LOGIN_ROOT}/profile` },
    { icon: 'users', name: 'Users', link: `${LOGIN_ROOT}/users` },
    { icon: 'dollar', name: 'Billing', link: `${LOGIN_ROOT}/billing` },
    { icon: 'gear', name: 'Settings', link: `${LOGIN_ROOT}/settings` },
    { icon: 'support', name: 'Support', link: '/support' },
  ]],
  ['community', [
    { icon: 'university', name: 'Guides', link: 'https://linode.com/docs' },
    { icon: 'comments', name: 'Forum', link: 'https://forum.linode.com' },
    { icon: 'book', name: 'Developers', link: 'https://developers.linode.com' },
  ]],
];

describe('components/Sidebar', () => {
  it('renders sidebar component', () => {
    const sidebar = shallow(
      <Sidebar path="/linodes" />
    );

    defaultLinks.map(([section, links], i) => {
      expect(sidebar.find('section').at(i).find('h3')
                    .text()).to.equal(section);
      links.map(({ icon, name, link }, j) => {
        const li = sidebar.find('section')
                          .at(i).find('li')
                          .at(j);
        expect(li.find({ className: `fa fa-${icon}` }).length).to.equal(1);
        expect(li.find('span').at(1).text()).to.equal(name);
        if (link.indexOf('http') === 0) {
          expect(sidebar.find({ href: link }).length).to.equal(1);
        } else {
          expect(sidebar.find({ to: link }).length).to.equal(1);
        }
      });
    });
  });

  it('renders sidebar component highlight only once', () => {
    const sidebar = shallow(
      <Sidebar path="/nodebalancers/24/linodes" />
    );

    expect(sidebar.find('li.active').length).to.equal(1);
    expect(sidebar.find('li.active').text()).to.equal('NodeBalancers');
  });
});

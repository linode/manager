import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';


import { ZONES } from '~/constants';
import { DashboardPage } from '~/linodes/linode/layouts/DashboardPage';

import { testLinode, testLinode1246 } from '~/data/linodes';


describe('linodes/linode/layouts/DashboardPage', async () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const props = {
    dispatch,
    linode: testLinode,
    timezone: 'UTC',
    transfer: { usage: 1, quota: 5 },
    username: 'tdude',
    images: {},
  };

  it('should render without error', () => {
    const wrapper = shallow(
      <DashboardPage
        {...props}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it.skip('renders public ipv4 and ipv6', () => {
    const { ipv4, ipv6 } = testLinode;
    const page = mount(
      <DashboardPage
        {...props}
      />
    );

    const ipSection = page.find('#ips');
    expect(ipSection.find('li').at(0).text()).toBe(ipv4[0]);
    expect(ipSection.find('li').at(1).text()).toBe(ipv6.split.skip('/')[0]);
  });

  it.skip('renders backups not enabled', () => {
    const page = mount(
      <DashboardPage
        {...{ ...props, linode: { ...testLinode, backups: { enabled: false } } }}
      />
    );

    expect(page.find('#backup-status').text()).toBe('Enable Backups');
  });

  it.skip('renders backups enabled', () => {
    const page = mount(
      <DashboardPage
        {...props}
      />
    );

    expect(page.find('#backup-status').text()).toBe('View Backups');
  });

  it.skip('renders region', () => {
    const page = mount(
      <DashboardPage
        {...props}
      />
    );

    expect(page.find('#region').text()).toBe(testLinode.region);
  });

  it.skip('renders image', () => {
    const page = mount(
      <DashboardPage
        {...props}
      />
    );

    expect(page.find('#distro').text()).toBe(`${testLinode.image.label}Rebuild`);
  });

  it.skip('renders unknown distribution', () => {
    const page = mount(
      <DashboardPage
        {...{ ...props, linode: testLinode1246 }}
      />
    );

    expect(page.find('#distro').text()).toBe('UnknownRebuild');
  });

  it.skip('renders ssh input elements', () => {
    const page = shallow(
      <DashboardPage
        linode={testLinode}
      />);

    expect(page.find('.input-group').at(0).find('Input').length).toBe(1);
    expect(page.find('.input-group').at(0).find('Button').length).toBe(1);
  });

  it.skip('renders ssh path', () => {
    const ipv4 = testLinode.ipv4;
    const sshPath = `ssh root@${ipv4[0]}`;
    const page = shallow(
      <DashboardPage
        {...props}
      />
    );

    expect(page.find('#ssh-input').props().value).toBe(sshPath);
  });

  it.skip('renders lish input elements', () => {
    const page = shallow(
      <DashboardPage
        {...props}
      />
    );

    expect(page.find('.input-group').at(1).find('Input').length).toBe(1);
    expect(page.find('.input-group').at(1).find('button')
      .at(0).length).toBe(1);
    expect(page.find('.input-group').at(1).find('button')
      .at(1).length).toBe(1);
  });

  it.skip('renders lish path', () => {
    const lishLink = `ssh -t tdude@lish-${
      ZONES[testLinode.region]
    }.linode.com`;
    const page = shallow(
      <DashboardPage
        {...props}
      />
    );

    expect(page.find('#lish-input').props())
      .to.have.property('value')
      .toBe(lishLink);
  });
});

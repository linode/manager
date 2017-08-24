import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';


import { ZONES } from '~/constants';
import { DashboardPage } from '~/linodes/linode/layouts/DashboardPage';

import { testLinode, testLinode1246 } from '@/data/linodes';


describe('linodes/linode/layouts/DashboardPage', async () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders public ipv4 and ipv6', () => {
    const { ipv4, ipv6 } = testLinode;
    const page = mount(
      <DashboardPage
        dispatch={dispatch}
        linode={testLinode}
        timezone="UTC"
      />);

    const ipSection = page.find('#ips');
    expect(ipSection.find('li').at(0).text()).to.equal(ipv4[0]);
    expect(ipSection.find('li').at(1).text()).to.equal(ipv6.split('/')[0]);
  });

  it('renders backups not enabled', () => {
    const page = mount(
      <DashboardPage
        linode={{ ...testLinode, backups: { enabled: false } }}
        timezone="UTC"
      />);

    expect(page.find('#backup-status').text()).to.equal('Enable Backups');
  });

  it('renders backups enabled', () => {
    const page = mount(
      <DashboardPage
        linode={testLinode}
        timezone="UTC"
      />);

    expect(page.find('#backup-status').text()).to.equal('View Backups');
  });

  it('renders region', () => {
    const page = mount(
      <DashboardPage
        linode={testLinode}
        timezone="UTC"
      />);

    expect(page.find('#region').text()).to.equal(testLinode.region.id);
  });

  it('renders distribution', () => {
    const page = mount(
      <DashboardPage
        linode={testLinode}
        timezone="UTC"
      />);

    expect(page.find('#distro').text()).to.equal(`${testLinode.distribution.label}Rebuild`);
  });

  it('renders unknown distribution', () => {
    const page = mount(
      <DashboardPage
        linode={testLinode1246}
        timezone="UTC"
      />);

    expect(page.find('#distro').text()).to.equal('UnknownRebuild');
  });

  it('renders ssh input elements', () => {
    const page = shallow(
      <DashboardPage
        linode={testLinode}
      />);

    expect(page.find('.input-group').at(0).find('Input').length).to.equal(1);
    expect(page.find('.input-group').at(0).find('Button').length).to.equal(1);
  });

  it('renders ssh path', () => {
    const ipv4 = testLinode.ipv4;
    const sshPath = `ssh root@${ipv4[0]}`;
    const page = shallow(
      <DashboardPage
        linode={testLinode}
      />);

    expect(page.find('#ssh-input').props().value).to.equal(sshPath);
  });

  it('renders lish input elements', () => {
    const page = shallow(
      <DashboardPage
        linode={testLinode}
      />);

    expect(page.find('.input-group').at(1).find('Input').length).to.equal(1);
    expect(page.find('.input-group').at(1).find('button')
      .at(0).length).to.equal(1);
    expect(page.find('.input-group').at(1).find('button')
      .at(1).length).to.equal(1);
  });

  it('renders lish path', () => {
    const lishLink = `ssh -t tdude@lish-${
        ZONES[testLinode.region.id]
      }.linode.com`;
    const page = shallow(
      <DashboardPage
        linode={testLinode}
        username="tdude"
      />);

    expect(page.find('#lish-input').props())
      .to.have.property('value')
      .to.equal(lishLink);
  });
});

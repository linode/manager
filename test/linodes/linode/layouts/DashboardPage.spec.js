import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { DashboardPage } from '~/linodes/linode/layouts/DashboardPage';
import { testLinode } from '@/data/linodes';
import { api } from '@/data';

const { linodes } = api;

describe('linodes/linode/layouts/DashboardPage', async () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const params = {
    linodeLabel: testLinode.label,
  };

  it('renders public ipv4 and ipv6', () => {
    const { ipv4, ipv6 } = testLinode;
    const page = mount(
      <DashboardPage
        dispatch={dispatch}
        linodes={linodes}
        params={params}
      />);

    const ipSection = page.find('.linode-ips');
    expect(ipSection.find('li').at(0).text()).to.equal(ipv4);
    expect(ipSection.find('li').at(1).text()).to.equal(ipv6.split('/')[0]);
  });

  it('renders backups not enabled', () => {
    const page = mount(
      <DashboardPage
        linodes={{ ...linodes,
          linodes: {
            ...linodes.linodes,
            [testLinode.id]: {
              ...testLinode,
              backups: { enabled: false },
            },
          } }}
        params={params}
      />);

    expect(page.find('.backup-status')
      .text()).to.equal('Enable Backups');
  });

  it('renders backups enabled', () => {
    const page = mount(
      <DashboardPage
        linodes={linodes}
        params={{ linodeLabel: 'test-linode' }}
      />);

    expect(page.find('.backup-status')
      .text()).to.equal('View Backups');
  });

  it('renders plan', () => {
    const page = mount(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.linode-plan').at(0)
      .find('.col-sm-9')
      .at(0)
      .text()).to.equal('Linode 2G');
  });

  it('renders datacenter', () => {
    const page = mount(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.linode-datacenter').at(0)
      .find('.col-sm-9')
      .at(0)
      .text()).to.equal(testLinode.datacenter.label);
  });

  it('renders distribution', () => {
    const page = mount(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.linode-distro').at(0)
      .find('.col-sm-9')
      .at(0)
      .text()).to.equal(testLinode.distribution.vendor);
  });

  it('renders unknown distribution', () => {
    const page = mount(
      <DashboardPage
        linodes={linodes}
        params={{ linodeLabel: 'test-linode-1246' }}
      />);

    expect(page.find('.linode-distro').at(0)
      .find('.col-sm-9')
      .children()
      .first()
      .text()).to.equal('Unknown');
  });

  it('renders ssh input elements', () => {
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.input-group').at(0).find('input').length).to.equal(1);
    expect(page.find('.input-group').at(0).find('Button').length).to.equal(1);
  });

  it('renders ssh path', () => {
    const ipv4 = testLinode.ipv4;
    const sshPath = `ssh root@${ipv4}`;
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.find('#ssh-input').props())
      .to.have.property('value')
      .to.equal(sshPath);
  });

  it('renders lish input elements', () => {
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.input-group').at(1).find('input').length).to.equal(1);
    expect(page.find('.input-group').at(1).find('button')
      .at(0).length).to.equal(1);
    expect(page.find('.input-group').at(1).find('button')
      .at(1).length).to.equal(1);
  });

  it('renders lish path', () => {
    const lishLink = `ssh -t tdude@lish-${
        testLinode.datacenter.id
      }.linode.com`;
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={params}
        username="tdude"
      />);

    expect(page.find('#lish-input').props())
      .to.have.property('value')
      .to.equal(lishLink);
  });

  it('renders glish button element', () => {
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.find('#glish-button').length).to.equal(1);
  });

  /*
  describe('performance graph', () => {
    it('renders source options', () => {
      const page = shallow(
        <DashboardPage
          linodes={linodes}
          params={params}
        />);

      const sourceInput = page.find('.select-source');
      expect(sourceInput.find('option').length).to.equal(4);
    });

    it('renders range options', () => {
      const page = shallow(
        <DashboardPage
          linodes={linodes}
          params={params}
        />);

      const rangeInput = page.find('.select-range');
      expect(rangeInput.find('option').length).to.equal(3);
    });

    it('changes source on change', () => {
      const page = shallow(
        <DashboardPage
          linodes={linodes}
          params={params}
        />);

      const sourceInput = page.find('.select-source');
      sourceInput.simulate('change', { target: { value: 'disk' } });
      expect(page.state('source')).to.equal('disk');
    });

    it('changes range on change', () => {
      const page = shallow(
        <DashboardPage
          linodes={linodes}
          params={params}
        />);

      const rangeInput = page.find('.select-range');
      rangeInput.simulate('change', { target: { value: 'last2day' } });
      expect(page.state('range')).to.equal('last2day');
    });

    it('renders the chart', () => {
      const page = shallow(
        <DashboardPage
          linodes={linodes}
          params={params}
        />);

      expect(page.find('Chart').length).to.equal(1);
    });
  });
  */
});

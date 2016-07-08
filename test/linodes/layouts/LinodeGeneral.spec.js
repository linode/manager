import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import { testLinode } from '~/../test/data';
import { LinodeGeneral } from '~/linodes/layouts/LinodeGeneral';
import * as LinodeDetailPage from '~/linodes/layouts/LinodeDetailPage';
import moment from 'moment';

describe('linodes/layouts/LinodeGeneral', async () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const linodes = {
    pagesFetched: [0],
    totalPages: 1,
    linodes: {
      [testLinode.id]: testLinode,
      linode_1235: {
        ...testLinode,
        id: 'linode_1235',
        group: '',
        backups: {
          last_backup: '2016-06-28T14:19:37',
          enabled: true,
        },
      },
    },
    _singular: 'linode',
    _plural: 'linodes',
  };
  const params = {
    linodeId: testLinode.id,
  };

  it('calls loadLinode on mount', () => {
    const loadLinode = sinon.stub(LinodeDetailPage, 'loadLinode');
    mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />
    );

    expect(loadLinode.calledOnce).to.equal(true);
    loadLinode.restore();
  });

  it('renders public ipv4', () => {
    const ipv4 = testLinode.ip_addresses['public'].ipv4[0];
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.contains(<li> {ipv4} </li>)).to.equal(true);
  });

  it('renders public ipv6', () => {
    const ipv6 = testLinode.ip_addresses['public'].ipv6;
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.contains(<li> {ipv6} </li>)).to.equal(true);
  });

  it('renders backups not enabled', () => {
    const path = `/linodes/${testLinode.id}/backups`;
    const page = shallow(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.linode-backups').at(0)
      .find('.col-sm-8')
      .at(0)
      .find('Link')
      .props())
      .have.property('to')
      .which.equal(path);
  });

  it('renders backups enabled', () => {
    const backupTime = linodes.linodes.linode_1235.backups.last_backup;
    const page = shallow(
      <LinodeGeneral
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
      />);

    expect(page.find('.linode-backups').at(0)
      .find('.col-sm-8')
      .at(0)
      .text()).to.equal(moment(backupTime).fromNow());
  });

  it('renders plan', () => {
    const page = shallow(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.linode-plan').at(0)
      .find('.col-sm-8')
      .at(0)
      .text()).to.equal('Linode 1G');
  });

  it('renders datacenter', () => {
    const page = shallow(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.linode-datacenter').at(0)
      .find('.col-sm-8')
      .at(0)
      .text()).to.equal(testLinode.datacenter.label);
  });

  it('renders distribution', () => {
    const page = shallow(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.linode-distro').at(0)
      .find('.col-sm-8')
      .at(0)
      .text()).to.equal(testLinode.distribution.label);
  });

  it('renders ssh input elements', () => {
    const page = shallow(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.input-group').at(0).find('input')).to.exist;
    expect(page.find('.input-group').at(0).find('button')).to.exist;
  });

  it('renders shh path', () => {
    const ipv4 = testLinode.ip_addresses['public'].ipv4[0];
    const sshPath = `ssh root@${ipv4}`;
    const page = shallow(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('#ssh-input').props())
      .to.have.property('value')
      .to.equal(sshPath);
  });

  it('renders lish input elements', () => {
    const page = shallow(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.input-group').at(1).find('input')).to.exist;
    expect(page.find('.input-group').at(1).find('button')
      .at(0)).to.exist;
    expect(page.find('.input-group').at(1).find('button')
      .at(1)).to.exist;
  });

  it('renders lish path', () => {
    const lishLink = `ssh -t tdude@lish-${
        testLinode.datacenter.datacenter
      }.linode.com`;
    const page = shallow(
      <LinodeGeneral
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
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('#glish-button')).to.exist;
  });
});

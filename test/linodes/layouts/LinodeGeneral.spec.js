import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import { testLinode } from '~/../test/data';
import { LinodeGeneral } from '~/linodes/layouts/LinodeGeneral';
import * as LinodeDetailPage from '~/linodes/layouts/LinodeDetailPage';

describe('linodes/layouts/LinodeGeneral', () => {
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
          last_backup: '1 hour ago',
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

  it('calls updateLinode on mount', async () => {
    LinodeDetailPage.updateLinode = sinon.spy();
    mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />
    );

    expect(LinodeDetailPage.updateLinode.calledOnce).to.equal(true);
  });

  it('renders public ipv4', async () => {
    const ipv4 = testLinode.ip_addresses['public'].ipv4[0];
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.contains(<li> {ipv4} </li>)).to.equal(true);
  });

  it('renders public ipv6', async () => {
    const ipv6 = testLinode.ip_addresses['public'].ipv6;
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.contains(<li> {ipv6} </li>)).to.equal(true);
  });

  it('renders link to networking', async () => {
    const path = `/linodes/${testLinode.id}/networking`;
    const page = shallow(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('Link').props())
      .to.have.property('to')
      .which.equals(path);
  });

  it('renders backups not enabled', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.col-sm-8').at(1).text()).to.equal('Backups not enabled.');
  });

  it('renders backups enabled', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
      />);

    expect(page.find('.col-sm-8').at(1).text()).to.equal('1 hour ago');
  });

  it('renders plan', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.col-sm-8').at(2).text()).to.equal(testLinode.services.linode);
  });

  it('renders datacenter', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.col-sm-8').at(3).text()).to.equal(testLinode.datacenter.label);
  });

  it('renders distribution', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.col-sm-8').at(4).text()).to.equal(testLinode.distribution.label);
  });

  it('renders ssh input elements', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.input-group').at(0).find('input')).to.exist;
    expect(page.find('.input-group').at(0).find('button')).to.exist;
  });

  it('renders shh path', async () => {
    const ipv4 = testLinode.ip_addresses['public'].ipv4[0];
    const sshPath = `ssh root@${ipv4}`;
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('#ssh-input').props())
      .to.have.property('value')
      .to.equal(sshPath);
  });

  it('renders lish input elements', async () => {
    const page = mount(
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

  it('renders lish path', async () => {
    const lishLink = `ssh -t caker@lish-${
        testLinode.datacenter.datacenter
      }.linode.com`;
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('#lish-input').props())
      .to.have.property('value')
      .to.equal(lishLink);
  });

  it('renders glish button element', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('#glish-button')).to.exist;
  });
});

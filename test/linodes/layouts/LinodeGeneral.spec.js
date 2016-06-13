import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { testLinode } from '~/../test/data';
import { LinodeGeneral } from '~/linodes/layouts/LinodeGeneral';

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
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(
      page.find('.row')
      .at(0)
      .find('a')
      .at(0)
      .text())
      .to.equal('(...)');
  });

  it('renders backups not enabled', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.contains(<div className="col-sm-8 right">Backups not enabled.</div>))
      .to.equal(true);
  });

  it('renders backups enabled', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
      />);

    expect(page.contains(<div className="col-sm-8 right">1 hour ago</div>)).to.equal(true);
  });

  it('renders plan', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.contains(<div className="col-sm-8 right">{testLinode.services.linode}</div>))
      .to.equal(true);
  });

  it('renders datacenter', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.contains(<div className="col-sm-8 right">{testLinode.datacenter.label}</div>))
      .to.equal(true);
  });

  it('renders distribution', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.contains(<div className="col-sm-8 right">{testLinode.distribution.label}</div>))
      .to.equal(true);
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
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.input-group').at(0).contains(
      <input type="text" className="form-control" value={`ssh root@${ipv4}`} readOnly />
    )).to.equal(true);
  });

  it('renders lish input elements', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.input-group').at(1).find('input')).to.exist;
    expect(page.find('.input-group').at(1).find('button')).to.exist;
  });

  it('renders lish path', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.input-group').at(1).contains(
      <input
        type="text"
        className="form-control"
        value={
          `ssh -t caker@lish-${
            testLinode.datacenter.datacenter
          }.linode.com`
        }
        readOnly
      />
    )).to.equal(true);
  });
  it('renders glish input element', async () => {
    const page = mount(
      <LinodeGeneral
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.input-group').at(2).find('button')).to.exist;
  });
});

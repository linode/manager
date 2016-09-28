import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { push } from 'react-router-redux';

import { IndexPage } from '~/linodes/create/layouts/IndexPage';
import * as errors from '~/actions/errors';
import * as apiLinodes from '~/actions/api/linodes';
import { api } from '@/data';

describe('linodes/create/layout/IndexPage', () => {
  const sandbox = sinon.sandbox.create();
  afterEach(() => {
    sandbox.restore();
  });

  function assertContains(thing) {
    return () => {
      const page = shallow(
        <IndexPage
          dispatch={() => {}}
          distros={api.distributions}
          datacenters={api.datacenters}
          services={api.services}
          linodes={api.linodes}
        />);
      expect(page.find(thing).length).to.equal(1);
    };
  }

  [
    'Source',
    'Datacenter',
    'Plan',
    'Details',
  ].map(t => it(`renders a ${t}`, assertContains(t)));

  it('changes the source tab when clicked', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        distros={api.distributions}
        datacenters={api.datacenters}
        services={api.services}
        linodes={api.linodes}
      />);
    const ss = page.find('Source');
    ss.props().onTabChange(1);
    expect(page.state('sourceTab')).to.equal(1);
  });

  it('autoselects a backup from query string info', async () => {
    const dispatch = sandbox.spy();
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        distros={api.distributions}
        datacenters={api.datacenters}
        services={api.services}
        linodes={api.linodes}
        location={{ query: { linode: 1234, backup: 54778593 } }}
      />);
    await page.instance().componentDidMount();
    const state = page.state();
    expect(state)
      .to.have.property('backup')
      .which.equals(54778593);
    expect(state)
      .to.have.property('sourceTab')
      .which.equals(1);
    expect(state)
      .to.have.property('datacenter')
      .which.equals('newark');
  });

  it('dispatches an error if fetching when mounted fails', async () => {
    sandbox.stub(errors, 'setError', e => e);
    const env = { dispatch() {} };
    const error = 'this is my error string';
    const dispatch = sandbox.stub(env, 'dispatch');
    dispatch.onCall(0).throws(new Error(error));

    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        distros={api.distributions}
        datacenters={api.datacenters}
        services={api.services}
        linodes={api.linodes}
        location={{ query: {} }}
      />);

    await page.instance().componentDidMount();

    expect(dispatch.calledTwice).to.equal(true);
    expect(dispatch.secondCall.args[0].message).to.equal(error);
  });

  it('selects a source when appropriate', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        distros={api.distributions}
        datacenters={api.datacenters}
        services={api.services}
        linodes={api.linodes}
      />);
    const ss = page.find('Source');
    ss.props().onSourceSelected('distribution', 'linode/arch2016.05');
    expect(page.instance().state.distribution).to.equal('linode/arch2016.05');
  });

  it('selects a datacenter when appropriate', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        distros={api.distributions}
        datacenters={api.datacenters}
        services={api.services}
        linodes={api.linodes}
      />);
    const ds = page.find('Datacenter');
    ds.props().onDatacenterSelected('newark');
    expect(page.instance().state.datacenter).to.equal('newark');
  });

  it('selects a service when appropriate', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        distros={api.distributions}
        datacenters={api.datacenters}
        services={api.services}
        linodes={api.linodes}
      />);
    const ss = page.find('Plan');
    ss.props().onServiceSelected('linode1024.5');
    expect(ss.find('.service.selected').find(<div className="title">Linode 1G</div>));
  });

  it('creates a linode when the form is submitted', async () => {
    const env = { dispatch() {} };
    const dispatch = sandbox.stub(env, 'dispatch');
    const createdLinodeId = 1;
    sandbox.stub(apiLinodes, 'createLinode', d => d);
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        distros={api.distributions}
        datacenters={api.datacenters}
        services={api.services}
        linodes={api.linodes}
      />
    );
    dispatch.reset();
    dispatch.onCall(0).returns({ id: createdLinodeId });

    page.find('Plan').props().onServiceSelected('service');
    page.find('Datacenter').props().onDatacenterSelected('datacenter');
    page.find('Source').props().onSourceSelected('distribution', 'source');
    await page.instance().onSubmit({
      labels: ['label'],
      password: 'password',
      backups: false,
      group: null,
    });
    expect(dispatch.calledTwice).to.equal(true);
    expect(dispatch.firstCall.args[0]).to.deep.equal({
      root_pass: 'password',
      service: 'service',
      distribution: 'source',
      backup: null,
      datacenter: 'datacenter',
      label: 'label',
      backups: false,
      group: null,
    });

    expect(dispatch.secondCall.args[0]).to.deep.equal(push(`/linodes/${createdLinodeId}`));
  });

  it('creates multiple linodes when the form is submitted', async () => {
    const env = { dispatch() {} };
    const dispatch = sandbox.stub(env, 'dispatch');
    const createdLinodeId = 1;
    sandbox.stub(apiLinodes, 'createLinode', d => d);
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        distros={api.distributions}
        datacenters={api.datacenters}
        services={api.services}
        linodes={api.linodes}
      />
    );
    dispatch.reset();
    dispatch.onCall(0).returns({ id: createdLinodeId });
    dispatch.onCall(1).returns({ id: createdLinodeId + 1 });

    page.find('Plan').props().onServiceSelected('service');
    page.find('Datacenter').props().onDatacenterSelected('datacenter');
    page.find('Source').props().onSourceSelected('distribution', 'source');
    await page.instance().onSubmit({
      labels: ['label', 'label-2'],
      password: 'password',
      backups: false,
      group: 'group',
    });
    expect(dispatch.callCount).to.equal(3);
    expect(dispatch.firstCall.args[0]).to.deep.equal({
      root_pass: 'password',
      service: 'service',
      distribution: 'source',
      backup: null,
      datacenter: 'datacenter',
      label: 'label',
      backups: false,
      group: 'group',
    });
    expect(dispatch.secondCall.args[0]).to.deep.equal({
      root_pass: 'password',
      service: 'service',
      distribution: 'source',
      backup: null,
      datacenter: 'datacenter',
      label: 'label-2',
      backups: false,
      group: 'group',
    });
    expect(dispatch.thirdCall.args[0]).to.deep.equal(push('/linodes'));
  });

  it('generates labels when submitting multiple linodes', async () => {
    const env = { dispatch() {} };
    const dispatch = sandbox.stub(env, 'dispatch');
    const createdLinodeId = 1;
    sandbox.stub(apiLinodes, 'createLinode', d => d);
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        distros={api.distributions}
        datacenters={api.datacenters}
        services={api.services}
        linodes={api.linodes}
      />
    );
    dispatch.reset();
    dispatch.onCall(0).returns({ id: createdLinodeId });
    dispatch.onCall(1).returns({ id: createdLinodeId + 1 });

    page.find('Plan').props().onServiceSelected('service');
    page.find('Datacenter').props().onDatacenterSelected('datacenter');
    page.find('Source').props().onSourceSelected('distribution', 'source');
    await page.instance().onSubmit({
      labels: ['label', null, null],
      password: 'password',
      backups: false,
      group: 'group',
    });
    expect(dispatch.firstCall.args[0]).to.deep.equal({
      root_pass: 'password',
      service: 'service',
      distribution: 'source',
      backup: null,
      datacenter: 'datacenter',
      label: 'label',
      backups: false,
      group: 'group',
    });
    expect(dispatch.secondCall.args[0]).to.deep.equal({
      root_pass: 'password',
      service: 'service',
      distribution: 'source',
      backup: null,
      datacenter: 'datacenter',
      label: 'label-1',
      backups: false,
      group: 'group',
    });
    expect(dispatch.thirdCall.args[0]).to.deep.equal({
      root_pass: 'password',
      service: 'service',
      distribution: 'source',
      backup: null,
      datacenter: 'datacenter',
      label: 'label-2',
      backups: false,
      group: 'group',
    });
  });

  it('sets errors on create a linode failure', async () => {
    const error = 'The error';
    const env = { dispatch() {} };
    const dispatch = sandbox.stub(env, 'dispatch');
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        distros={api.distributions}
        datacenters={api.datacenters}
        services={api.services}
        linodes={api.linodes}
      />
    );
    dispatch.reset();
    dispatch.onCall(0).throws({ json: () => ({ errors: [{ field: 'label', reason: error }] }) });

    page.find('Plan').props().onServiceSelected('service');
    page.find('Datacenter').props().onDatacenterSelected('datacenter');
    page.find('Source').props().onSourceSelected('distribution', 'source');
    await page.instance().onSubmit({
      group: 'group',
      labels: ['label'],
      password: 'password',
      backups: false,
    });

    expect(page.state('errors')).to.deep.equal({ label: [error] });
  });
});

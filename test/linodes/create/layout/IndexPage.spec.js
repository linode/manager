import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { push } from 'react-router-redux';

import { IndexPage } from '~/linodes/create/layouts/IndexPage';
import * as errors from '~/actions/errors';
import { linodes as thunks } from '~/api';
import { api } from '@/data';
import { expectObjectDeepEquals } from '@/common';

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
          distributions={api.distributions}
          datacenters={api.datacenters}
          types={api.types}
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

  it('autoselects a backup from query string info', async () => {
    const dispatch = sandbox.spy();
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        distributions={api.distributions}
        datacenters={api.datacenters}
        types={api.types}
        linodes={api.linodes}
        location={{ query: { linode: 1234, backup: 54782214 } }}
      />);
    await page.instance().componentDidMount();
    const state = page.state();
    expect(state)
      .to.have.property('backup')
      .which.equals(54782214);
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

    await IndexPage.preload({ dispatch }, { });

    expect(dispatch.callCount).to.equal(2);
    expect(dispatch.args[1][0].message).to.equal(error);
  });

  it('selects a source when appropriate', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        distributions={api.distributions}
        datacenters={api.datacenters}
        types={api.types}
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
        distributions={api.distributions}
        datacenters={api.datacenters}
        types={api.types}
        linodes={api.linodes}
      />);
    const ds = page.find('Datacenter');
    ds.props().onDatacenterSelected('newark');
    expect(page.instance().state.datacenter).to.equal('newark');
  });

  it('selects a type when appropriate', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        distributions={api.distributions}
        datacenters={api.datacenters}
        types={api.types}
        linodes={api.linodes}
      />);
    const ss = page.find('Plan');
    ss.props().onServiceSelected('linode1024.5');
    expect(ss.find('.type.selected').find(<div className="title">Linode 1G</div>));
  });

  it('creates a linode when the form is submitted', async () => {
    const env = { dispatch() {} };
    const dispatch = sandbox.stub(env, 'dispatch');
    const createdLinodeId = 1;
    sandbox.stub(thunks, 'post', d => d);
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        distributions={api.distributions}
        datacenters={api.datacenters}
        types={api.types}
        linodes={api.linodes}
      />
    );
    dispatch.reset();
    dispatch.onCall(0).returns({ id: createdLinodeId });

    page.find('Plan').props().onServiceSelected('type');
    page.find('Datacenter').props().onDatacenterSelected('datacenter');
    page.find('Source').props().onSourceSelected('distribution', 'source');
    await page.instance().onSubmit({
      label: 'label',
      password: 'password',
      backups: false,
      group: null,
    });
    expect(dispatch.callCount).to.equal(3);
    expectObjectDeepEquals(dispatch.firstCall.args[0], {
      root_pass: 'password',
      type: 'type',
      distribution: 'source',
      backup: null,
      datacenter: 'datacenter',
      label: 'label',
      with_backups: false,
      group: null,
    });
    expectObjectDeepEquals(dispatch.thirdCall.args[0], push('/linodes/label'));
  });

  it('sets errors on create a linode failure', async () => {
    const error = 'The error';
    const env = { dispatch() {} };
    const dispatch = sandbox.stub(env, 'dispatch');
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        distributions={api.distributions}
        datacenters={api.datacenters}
        types={api.types}
        linodes={api.linodes}
      />
    );
    dispatch.reset();
    dispatch.onCall(0).throws({ json: () => ({ errors: [{ field: 'label', reason: error }] }) });

    page.find('Plan').props().onServiceSelected('type');
    page.find('Datacenter').props().onDatacenterSelected('datacenter');
    page.find('Source').props().onSourceSelected('distribution', 'source');
    await page.instance().onSubmit({
      group: 'group',
      labels: ['label'],
      password: 'password',
      backups: false,
    });
    expectObjectDeepEquals(page.state('errors'), { label: [{ field: 'label', reason: error }] });
  });
});

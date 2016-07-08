import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import { IndexPage } from '~/linodes/create/layouts/IndexPage';
import * as fetch from '~/fetch';
import { UPDATE_DISTROS } from '~/actions/api/distros';
import { UPDATE_DATACENTERS } from '~/actions/api/datacenters';
import { UPDATE_SERVICES } from '~/actions/api/services';
import * as errors from '~/actions/errors';
import * as apiLinodes from '~/actions/api/linodes';
import { state } from '~/../test/data';

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
          distros={state.distros}
          datacenters={state.datacenters}
          services={state.services}
        />);
      expect(page.find(thing)).to.exist;
    };
  }

  [
    'SourceSelection',
    'DatacenterSelection',
    'ServiceSelection',
    'Details',
  ].map(t => it(`renders a ${t}`, assertContains(t)));

  it('changes the source tab when clicked', () => {
    const page = mount(
      <IndexPage
        dispatch={() => {}}
        distros={state.distros}
        datacenters={state.datacenters}
        services={state.services}
      />);
    const ss = page.find('SourceSelection');
    ss.props().onTabChange(2);
    expect(ss.find('Tab').at(2).props().selected)
      .to.equal(true);
  });

  it('fetches distros, datacenters, and services when mounted', async () => {
    const dispatch = sandbox.spy();
    mount(
      <IndexPage
        dispatch={dispatch}
        distros={state.distros}
        datacenters={state.datacenters}
        services={state.services}
      />);
    expect(dispatch.calledThrice).to.equal(true);

    const dispatchedDistros = dispatch.firstCall.args[0];
    const dispatchedDatacenters = dispatch.secondCall.args[0];
    const dispatchedServices = dispatch.thirdCall.args[0];

    // Assert that dispatchedDistros is a function that fetches distros
    dispatch.reset();
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => {},
    });
    await dispatchedDistros(dispatch, () => ({
      authentication: { token: 'token' },
    }));
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[1]).to.equal('/distributions/?page=1');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0].type).to.equal(UPDATE_DISTROS);

    // Assert that dispatchedDatacenters is a function that fetches datacenters
    dispatch.reset();
    await dispatchedDatacenters(dispatch, () => ({
      authentication: { token: 'token' },
    }));
    expect(fetchStub.calledTwice).to.equal(true);
    expect(fetchStub.secondCall.args[1]).to.equal('/datacenters/?page=1');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0].type).to.equal(UPDATE_DATACENTERS);

    // Assert that dispatchedServices is a function that fetches services
    dispatch.reset();
    await dispatchedServices(dispatch, () => ({
      authentication: { token: 'token' },
    }));
    expect(fetchStub.calledThrice).to.equal(true);
    expect(fetchStub.thirdCall.args[1]).to.equal('/services/?page=1');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0].type).to.equal(UPDATE_SERVICES);
  });

  it('dispatches an error if fetching when mounted fails', async () => {
    sandbox.stub(errors, 'setError', e => e);
    const env = { dispatch() {} };
    const error = 'this is my error string';
    const dispatch = sandbox.stub(env, 'dispatch');
    dispatch.onCall(0).throws(new Error(error));

    await mount(
      <IndexPage
        dispatch={dispatch}
        distros={state.distros}
        datacenters={state.datacenters}
        services={state.services}
      />
    );

    expect(dispatch.calledTwice).to.equal(true);
    expect(dispatch.secondCall.args[0].message).to.equal(error);
  });

  it('selects a source when appropriate', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        distros={state.distros}
        datacenters={state.datacenters}
        services={state.services}
      />);
    const ss = page.find('SourceSelection');
    ss.props().onSourceSelected({ id: 'distro_1234' });
    expect(ss.find('.distro.selected').find(<div className="title">Arch 2016.05</div>))
      .to.exist;
  });

  it('selects a datacenter when appropriate', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        distros={state.distros}
        datacenters={state.datacenters}
        services={state.services}
      />);
    const ds = page.find('DatacenterSelection');
    ds.props().onDatacenterSelected({ id: 'datacenter_2' });
    expect(ds.find('.datacenter.selected').find(<div className="title">Newark, NJ</div>))
      .to.exist;
  });

  it('selects a service when appropriate', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        distros={state.distros}
        datacenters={state.datacenters}
        services={state.services}
      />);
    const ss = page.find('ServiceSelection');
    ss.props().onServiceSelected({ id: 'linode1024.5' });
    expect(ss.find('.service.selected').find(<div className="title">Linode 1G</div>));
  });

  it('creates a linode when the form is submitted', async () => {
    const dispatch = sandbox.spy();
    sandbox.stub(apiLinodes, 'addLinode', d => d);
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        distros={state.distros}
        datacenters={state.datacenters}
        services={state.services}
      />
    );
    dispatch.reset();

    const expectIsDisabled = () => expect(page.find('button[type="submit"]').props().disabled)
      .to.equal(true);

    expectIsDisabled();
    page.find('ServiceSelection').props().onServiceSelected('service');
    expectIsDisabled();
    page.find('DatacenterSelection').props().onDatacenterSelected('datacenter');
    expectIsDisabled();
    page.find('SourceSelection').props().onSourceSelected('source');
    expectIsDisabled();
    await page.find('Details').props().onSubmit({ label: 'label', password: 'password' });
    expect(dispatch.calledTwice).to.equal(true);
    expect(dispatch.firstCall.args[0]).to.deep.equal({
      root_pass: 'password',
      service: 'service',
      source: 'source',
      datacenter: 'datacenter',
      label: 'label',
    });
  });

  it('sets errors on create a linode failure', async () => {
    const error = 'The error';
    function ResponseError() {
      return { json() {
        return new Promise((accept) => accept({
          errors: [{ field: 'label', reason: error }],
        }));
      } };
    }

    const env = { dispatch() {} };
    const dispatch = sandbox.stub(env, 'dispatch');
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        distros={state.distros}
        datacenters={state.datacenters}
        services={state.services}
      />
    );
    dispatch.reset();
    dispatch.onCall(0).throws(new ResponseError());

    page.find('ServiceSelection').props().onServiceSelected('service');
    page.find('DatacenterSelection').props().onDatacenterSelected('datacenter');
    page.find('SourceSelection').props().onSourceSelected('source');
    await page.find('Details').props().onSubmit({ label: '', password: '' });

    expect(page.find('Details').props().errors).to.deep.equal({
      label: [error],
    });
  });
});

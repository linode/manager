import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import { IndexPage } from '~/linodes/create/layouts/IndexPage';
import * as sourceActions from '~/linodes/actions/create/source';
import * as datacenterActions from '~/linodes/actions/create/datacenter';
import * as serviceActions from '~/linodes/actions/create/service';
import * as fetch from '~/fetch';
import { UPDATE_DISTROS } from '~/actions/api/distros';
import { UPDATE_DATACENTERS } from '~/actions/api/datacenters';
import { UPDATE_SERVICES } from '~/actions/api/services';
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
          create={state.create}
          distros={state.distros}
          datacenters={state.datacenters}
          services={state.services}
        />);
      expect(page.find(thing).length).to.equal(1);
    };
  }

  [
    'SourceSelection',
    'DatacenterSelection',
    'ServiceSelection',
    'OrderSummary',
  ].map(t => it(`renders a ${t}`, assertContains(t)));

  it('changes the source tab when clicked', () => {
    const dispatch = sandbox.spy();
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        distros={state.distros}
        create={state.create}
        datacenters={state.datacenters}
        services={state.services}
      />);
    dispatch.reset();
    page.find('SourceSelection').props().onTabChange(2);
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.calledWith(sourceActions.changeSourceTab(2)))
      .to.equal(true);
  });

  it('fetches distros, datacenters, and services when mounted', async () => {
    const dispatch = sandbox.spy();
    mount(
      <IndexPage
        dispatch={dispatch}
        distros={state.distros}
        create={state.create}
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
    expect(fetchStub.firstCall.args[1]).to.equal('/distributions?page=1');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0].type).to.equal(UPDATE_DISTROS);

    // Assert that dispatchedDatacenters is a function that fetches datacenters
    dispatch.reset();
    await dispatchedDatacenters(dispatch, () => ({
      authentication: { token: 'token' },
    }));
    expect(fetchStub.calledTwice).to.equal(true);
    expect(fetchStub.secondCall.args[1]).to.equal('/datacenters?page=1');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0].type).to.equal(UPDATE_DATACENTERS);

    // Assert that dispatchedServices is a function that fetches services
    dispatch.reset();
    await dispatchedServices(dispatch, () => ({
      authentication: { token: 'token' },
    }));
    expect(fetchStub.calledThrice).to.equal(true);
    expect(fetchStub.thirdCall.args[1]).to.equal('/services?page=1');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0].type).to.equal(UPDATE_SERVICES);
  });

  it('selects a source when appropriate', () => {
    const dispatch = sandbox.spy();
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        distros={state.distros}
        create={state.create}
        datacenters={state.datacenters}
        services={state.services}
      />);
    dispatch.reset();
    page.find('SourceSelection').props().onSourceSelected({ id: 'distro_1234' });
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.calledWith(sourceActions.selectSource('distro_1234')))
      .to.equal(true);
  });

  it('selects a datacenter when appropriate', () => {
    const dispatch = sandbox.spy();
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        distros={state.distros}
        create={state.create}
        datacenters={state.datacenters}
        services={state.services}
      />);
    dispatch.reset();
    page.find('DatacenterSelection').props().onDatacenterSelected({ id: 'datacenter_2' });
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.calledWith(datacenterActions.selectDatacenter('datacenter_2')))
      .to.equal(true);
  });

  it('selects a service when appropriate', () => {
    const dispatch = sandbox.spy();
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        distros={state.distros}
        create={state.create}
        datacenters={state.datacenters}
        services={state.services}
      />);
    dispatch.reset();
    page.find('ServiceSelection').props().onServiceSelected({ id: 'service_112' });
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.calledWith(serviceActions.selectService('service_112')))
      .to.equal(true);
  });
});

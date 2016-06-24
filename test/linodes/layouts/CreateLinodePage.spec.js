import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import { CreateLinodePage } from '~/linodes/layouts/CreateLinodePage';
import * as sourceActions from '~/linodes/actions/create/source';
import * as fetch from '~/fetch';
import { UPDATE_DISTROS } from '~/actions/api/distros';

describe('linodes/layout/CreateLinodePage', () => {
  const sandbox = sinon.sandbox.create();
  afterEach(() => {
    sandbox.restore();
  });

  const state = {
    create: {
      source: {
        source: null,
        sourceTab: 0,
      },
    },
    distros: {
      distributions: { },
    },
  };

  function assertContains(thing) {
    return () => {
      const page = shallow(
        <CreateLinodePage
          dispatch={() => {}}
          create={state.create}
          distros={state.distros}
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
      <CreateLinodePage
        dispatch={dispatch}
        distros={state.distros}
        create={state.create}
      />);
    dispatch.reset();
    page.find('SourceSelection').props().onTabChange(2);
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.calledWith(sourceActions.changeSourceTab(2)))
      .to.equal(true);
  });

  it('fetches distros when mounted', async () => {
    const dispatch = sandbox.spy();
    mount(
      <CreateLinodePage
        dispatch={dispatch}
        distros={state.distros}
        create={state.create}
      />);
    expect(dispatch.calledOnce).to.equal(true);
    const dispatched = dispatch.firstCall.args[0];
    // Assert that dispatched is a function that fetches linodes
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => {},
    });
    dispatch.reset();
    await dispatched(dispatch, () => ({
      authentication: { token: 'token' },
    }));
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[1]).to.equal('/distributions?page=1');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0].type).to.equal(UPDATE_DISTROS);
  });

  it('selects a source when appropriate', () => {
    const dispatch = sandbox.spy();
    const page = shallow(
      <CreateLinodePage
        dispatch={dispatch}
        distros={state.distros}
        create={state.create}
      />);
    dispatch.reset();
    page.find('SourceSelection').props().onSourceSelected({ id: 'distro_1234' });
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.calledWith(sourceActions.selectSource('distro_1234')))
      .to.equal(true);
  });
});

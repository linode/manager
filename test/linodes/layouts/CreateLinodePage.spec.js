import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { CreateLinodePage } from '~/linodes/layouts/CreateLinodePage';
import * as sourceActions from '~/linodes/actions/create/source';

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
});

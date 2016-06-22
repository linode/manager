import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import SourceSelection from '~/linodes/components/SourceSelection';
import { Tab } from 'react-tabs';

describe('linodes/components/DatacenterSelection', () => {
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

  it('renders the card header', () => {
    const c = shallow(
      <SourceSelection
        source={state.create.source}
        sourceTab={state.create.sourceTab}
      />
    );
    expect(c.contains(<h2>Select a source</h2>)).to.equal(true);
  });

  it('renders the source tabs', () => {
    const c = shallow(
      <SourceSelection
        source={state.create.source}
        sourceTab={state.create.sourceTab}
      />
    );
    expect(c.contains(<Tab>Distributions</Tab>)).to.equal(true);
    expect(c.contains(<Tab>StackScripts</Tab>)).to.equal(true);
    expect(c.contains(<Tab>Backups</Tab>)).to.equal(true);
  });

  it('raises the onTabChange function as necessary', () => {
    const onTabChange = sandbox.spy();
    const c = shallow(
      <SourceSelection
        source={state.create.source}
        sourceTab={state.create.sourceTab}
        onTabChange={onTabChange}
      />
    );
    c.find('Tabs').props().onSelect(2);
    expect(onTabChange.calledOnce).to.equal(true);
    expect(onTabChange.calledWith(2)).to.equal(true);
  });
});

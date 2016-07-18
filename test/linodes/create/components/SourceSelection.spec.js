import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import SourceSelection from '~/linodes/create/components/SourceSelection';
import { Tab } from 'react-tabs';
import { testDistros, linodes } from '~/../test/data';

describe('linodes/create/components/SourceSelection', () => {
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
    distros: { distributions: { ...testDistros } },
    linodes: { linodes },
  };

  it('renders the card header', () => {
    const c = shallow(
      <SourceSelection
        distros={state.distros.distributions}
        source={state.create.source.source}
        selectedTab={state.create.source.sourceTab}
        linodes={state.linodes}
      />
    );
    expect(c.contains(<h2>Select a source</h2>)).to.equal(true);
  });

  it('renders the source tabs', () => {
    const c = shallow(
      <SourceSelection
        distros={state.distros.distributions}
        source={state.create.source.source}
        selectedTab={state.create.source.sourceTab}
        linodes={linodes}
      />
    );
    expect(c.contains(<Tab>Distributions</Tab>)).to.equal(true);
    expect(c.contains(<Tab>Backups</Tab>)).to.equal(true);
  });

  it('invokes the onTabChange function as necessary', () => {
    const onTabChange = sandbox.spy();
    const c = shallow(
      <SourceSelection
        distros={state.distros.distributions}
        source={state.create.source.source}
        selectedTab={state.create.source.sourceTab}
        onTabChange={onTabChange}
        linodes={linodes}
      />);
    c.find('Tabs').props().onSelect(2);
    expect(onTabChange.calledOnce).to.equal(true);
    expect(onTabChange.calledWith(2)).to.equal(true);
  });

  it('renders DistroVendors', () => {
    const c = shallow(
      <SourceSelection
        distros={state.distros.distributions}
        source={state.create.source.source}
        selectedTab={state.create.source.sourceTab}
        linodes={linodes}
      />);
    expect(c.find('DistroVendor').length).to.equal(2);
  });

  it('invokes the onSourceSelected function as necessary', () => {
    const onSourceSelected = sandbox.spy();
    const c = shallow(
      <SourceSelection
        distros={state.distros.distributions}
        source={state.create.source.source}
        selectedTab={state.create.source.sourceTab}
        onSourceSelected={onSourceSelected}
        linodes={linodes}
      />);
    const distro = state.distros.distributions.distro_1234;
    c.find('DistroVendor').first().props()
      .onClick(distro);
    expect(onSourceSelected.calledOnce).to.equal(true);
    expect(onSourceSelected.calledWith(distro)).to.equal(true);
  });
});

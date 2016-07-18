import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import SourceSelection from '~/linodes/create/components/SourceSelection';
import { Tab } from 'react-tabs';
import { testDistros, linodes } from '~/../test/data';

describe('linodes/create/components/SourceSelection', () => {
  const sandbox = sinon.sandbox.create();
  afterEach(() => {
    sandbox.restore();
  });

  const state = {
    linodes,
    create: {
      source: {
        source: null,
        sourceTab: 0,
      },
    },
    distros: { distributions: { ...testDistros } },
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
        linodes={state.linodes}
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
        linodes={state.linodes}
      />);
    c.find('Tabs').props().onSelect(1);
    expect(onTabChange.calledOnce).to.equal(true);
    expect(onTabChange.calledWith(1)).to.equal(true);
  });

  it('renders DistroVendors', () => {
    const c = shallow(
      <SourceSelection
        distros={state.distros.distributions}
        source={state.create.source.source}
        selectedTab={0}
        linodes={state.linodes}
      />);
    expect(c.find('DistroVendor').length).to.equal(2);
  });

  it('renders Backups', () => {
    const c = mount(
      <SourceSelection
        distros={state.distros.distributions}
        source={state.create.source.source}
        selectedTab={1}
        linodes={state.linodes}
      />
    );

    expect(c.find('h3').length).to.equal(1);
    expect(c.find(<h3>Test Linode</h3>)).to.exist;
    expect(c.find('.backup-group').length).to.equal(1);
    expect(c.find('Backup').length).to.equal(1);
  });

  it('invokes the onSourceSelected function as necessary for Distros', () => {
    const onSourceSelected = sandbox.spy();
    const c = mount(
      <SourceSelection
        distros={state.distros.distributions}
        source={state.create.source.source}
        selectedTab={0}
        onSourceSelected={onSourceSelected}
        linodes={state.linodes}
      />
    );
    const distro = state.distros.distributions.distro_1234;
    c.find('DistroVendor').first().props()
     .onClick(distro);
    expect(onSourceSelected.calledOnce).to.equal(true);
    expect(onSourceSelected.calledWith(distro)).to.equal(true);
  });

  it('invokes the onSourceSelected function as necessary for Backups', () => {
    const onSourceSelected = sandbox.spy();
    const c = mount(
      <SourceSelection
        distros={state.distros.distributions}
        source={state.create.source.source}
        selectedTab={1}
        onSourceSelected={onSourceSelected}
        linodes={state.linodes}
      />
    );
    c.find('Backup').first().simulate('click');
    expect(onSourceSelected.calledOnce).to.equal(true);
    expect(onSourceSelected.calledWith('backup_54778593')).to.equal(true);
  });
});

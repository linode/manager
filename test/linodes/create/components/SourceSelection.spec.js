import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import { Tab } from 'react-tabs';
import moment from 'moment';

import SourceSelection from '~/linodes/create/components/SourceSelection';
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

  const moreBackupsLinodes = {
    ...state.linodes,
    linodes: {
      ...state.linodes.linodes,
      linode_1240: {
        ...state.linodes.linodes.linode_1234,
        id: 'linode_1240',
        created: moment(state.linodes.linodes.linode_1234.created) + 60,
        label: 'More backups',
      },
    },
  };

  it('only shows shows n linodes per page of Backups', () => {
    const c = mount(
      <SourceSelection
        distros={state.distros.distributions}
        source={state.create.source.source}
        selectedTab={1}
        onSourceSelected={() => {}}
        linodes={moreBackupsLinodes}
        perPageLimit={1}
      />
    );

    expect(c.find('Backup').length).to.equal(1);
  });

  it('changes pages when requested', () => {
    const c = mount(
      <SourceSelection
        distros={state.distros.distributions}
        source={state.create.source.source}
        selectedTab={1}
        onSourceSelected={() => {}}
        linodes={moreBackupsLinodes}
        perPageLimit={1}
      />
    );

    // Initial backup is the Test Backup
    expect(c.find('h3').length).to.equal(1);
    expect(c.find('h3').text()).to.equal('Test Linode');
    // Next page
    c.find('.next').simulate('click', { preventDefault() {} });
    // First backup is the second backup
    expect(c.find('h3').length).to.equal(1);
    expect(c.find('h3').text()).to.equal('More backups');
    // Previous page
    c.find('.previous').simulate('click', { preventDefault() {} });
    // First backup is original
    expect(c.find('h3').length).to.equal(1);
    expect(c.find('h3').text()).to.equal('Test Linode');
  });

  it('filters backups when updating filter', () => {
    const c = mount(
      <SourceSelection
        distros={state.distros.distributions}
        source={state.create.source.source}
        selectedTab={1}
        onSourceSelected={() => {}}
        linodes={moreBackupsLinodes}
      />
    );

    // Starts out with both backups
    expect(c.find('.backup-group').length).to.equal(2);
    // Filter on 'More'
    c.find('.filter input').simulate('change', { target: { value: 'More' } });
    // Only show 'More backups' linode
    expect(c.find('.backup-group').length).to.equal(1);
    expect(c.find('h3').text()).to.equal('More backups');

    // Reset filter
    c.find('.filter input').simulate('change', { target: { value: '' } });
    // All backups should be shown
    expect(c.find('.backup-group').length).to.equal(2);
  });
});

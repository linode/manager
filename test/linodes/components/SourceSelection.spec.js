import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import SourceSelection from '~/linodes/components/SourceSelection';
import { Tab } from 'react-tabs';

describe('linodes/components/SourceSelection', () => {
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
      distributions: {
        distro_1234: {
          recommended: true,
          vendor: 'Arch',
          label: 'Arch Linux 2016.05',
          created: '2009-08-17T00:00:00',
        },
        distro_1235: {
          recommended: false,
          vendor: 'Arch',
          label: 'Arch Linux 2015.05',
          created: '2009-08-17T00:00:00',
        },
        distro_1236: {
          recommended: true,
          vendor: 'Debian',
          label: 'Debian 7',
          created: '2009-08-17T00:00:00',
        },
        distro_1237: {
          recommended: true,
          vendor: 'Debian',
          label: 'Debian 8.1',
          created: '2009-08-17T00:00:00',
        },
        distro_1238: {
          recommended: false,
          vendor: 'Debian',
          label: 'Debian 6',
          created: '2009-08-17T00:00:00',
        },
      },
    },
  };

  it('renders the card header', () => {
    const c = shallow(
      <SourceSelection
        distros={state.distros.distributions}
        source={state.create.source.source}
        selectedTab={state.create.source.sourceTab}
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
        distros={state.distros.distributions}
        source={state.create.source.source}
        selectedTab={state.create.source.sourceTab}
        onTabChange={onTabChange}
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
      />);
    expect(c.find('DistroVendor').length).to.equal(2);
  });
});

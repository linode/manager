import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { Tab } from 'react-tabs';
import moment from 'moment';
import _ from 'lodash';

import SourceSelection from '~/linodes/create/components/SourceSelection';
import { api } from '@/data';

describe('linodes/create/components/SourceSelection', () => {
  const sandbox = sinon.sandbox.create();
  afterEach(() => {
    sandbox.restore();
  });

  it('renders the card header', () => {
    const c = shallow(
      <SourceSelection
        distros={api.distributions}
        linodes={api.linodes}
        source={null}
        selectedTab={0}
      />
    );
    expect(c.contains(<h2>Select a source</h2>)).to.equal(true);
  });

  it('renders the source tabs', () => {
    const c = shallow(
      <SourceSelection
        distros={api.distributions}
        linodes={api.linodes}
        source={null}
        selectedTab={0}
      />
    );
    expect(c.contains(<Tab>Distributions</Tab>)).to.equal(true);
    expect(c.contains(<Tab>Backups</Tab>)).to.equal(true);
  });

  it('invokes the onTabChange function as necessary', () => {
    const onTabChange = sandbox.spy();
    const c = shallow(
      <SourceSelection
        distros={api.distributions}
        linodes={api.linodes}
        source={null}
        selectedTab={0}
        onTabChange={onTabChange}
      />);
    c.find('Tabs').props().onSelect(1);
    expect(onTabChange.calledOnce).to.equal(true);
    expect(onTabChange.calledWith(1)).to.equal(true);
  });

  it('renders DistroVendors', () => {
    const c = shallow(
      <SourceSelection
        distros={api.distributions.distributions}
        linodes={api.linodes}
        source={null}
        selectedTab={0}
      />);
    expect(c.find('DistroVendor').length)
      .to.equal(Object.values(
        _.groupBy(Object.values(api.distributions.distributions),
          d => d.vendor)).length
      );
  });

  it('invokes the onSourceSelected function as necessary for Distros', () => {
    const onSourceSelected = sandbox.spy();
    const c = shallow(
      <SourceSelection
        distros={api.distributions}
        linodes={api.linodes}
        source={null}
        selectedTab={0}
        onSourceSelected={onSourceSelected}
      />
    );
    const distro = api.distributions.distributions.distro_1234;
    c.find('DistroVendor').first().props()
     .onClick(distro);
    expect(onSourceSelected.calledOnce).to.equal(true);
    expect(onSourceSelected.calledWith(distro)).to.equal(true);
  });

  const moreBackupsLinodes = {
    ...api.linodes,
    linodes: {
      ...api.linodes.linodes,
      linode_1240: {
        ...api.linodes.linodes.linode_1234,
        id: 'linode_1240',
        created: moment(api.linodes.linodes.linode_1234.created) + 60,
        label: 'More backups',
      },
    },
  };

  it('renders Linodes', () => {
    const c = shallow(
      <SourceSelection
        distros={api.distributions}
        linodes={moreBackupsLinodes}
        source={null}
        selectedTab={1}
      />
    );

    expect(c.find('table tbody tr').length).to.equal(2);
    // Pagination not shown because the number of rows is less than rowsPerPage(=20)
    expect(c.find('.pagination').length).to.equal(0);
  });

  it('only shows shows n linodes per page of Backups', () => {
    const c = shallow(
      <SourceSelection
        distros={api.distributions}
        linodes={moreBackupsLinodes}
        source={null}
        selectedTab={1}
        onSourceSelected={() => {}}
        perPageLimit={1}
      />
    );

    // Only 1 row
    expect(c.find('table tbody tr').length).to.equal(1);
    // Four buttons (Previous, 1st page, 2nd page, Next)
    expect(c.find('.page-item').length).to.equal(4);
    expect(c.find('.page-item').at(0).text()).to.equal('«');
    expect(c.find('.page-item').at(1).text()).to.equal('1');
    expect(c.find('.page-item').at(2).text()).to.equal('2');
    expect(c.find('.page-item').at(3).text()).to.equal('»');
  });

  it('changes pages when requested', () => {
    const c = shallow(
      <SourceSelection
        distros={api.distributions}
        linodes={moreBackupsLinodes}
        source={null}
        selectedTab={1}
        onSourceSelected={() => {}}
        perPageLimit={1}
      />
    );

    const expectOnly = label => {
      expect(c.find('table tbody tr').length).to.equal(1);
      expect(c.find('tbody td').at(0).text()).to.equal(label);
    };
    const clickNth = n =>
      c.find('.pagination .page-item').at(n).find('a')
       .simulate('click', { preventDefault() {} });

    // Initial backup is the Test Backup
    expectOnly('Test Linode');
    // Previous does nothing
    clickNth(0);
    expectOnly('Test Linode');
    // First page does nothing
    clickNth(1);
    expectOnly('Test Linode');
    // Second page shows second linode
    clickNth(2);
    expectOnly('More backups');
    // Next page does nothing
    clickNth(3);
    expectOnly('More backups');
    // Previous goes to first page
    clickNth(0);
    expectOnly('Test Linode');
    // Next goes to second page
    clickNth(3);
    expectOnly('More backups');
  });

  it('filters backups when updating filter', () => {
    const c = shallow(
      <SourceSelection
        distros={api.distributions}
        linodes={moreBackupsLinodes}
        source={null}
        selectedTab={1}
        onSourceSelected={() => {}}
      />
    );

    // Show all linodes
    expect(c.find('table tbody tr').length).to.equal(2);
    // Filter on 'More'
    c.find('.filter input').simulate('change', { target: { value: 'More' } });
    // Only show 'More backups' linode
    expect(c.find('table tbody tr').length).to.equal(1);
    expect(c.find('tbody tr td').at(0).text()).to.equal('More backups');

    // Reset filter
    c.find('.filter input').simulate('change', { target: { value: '' } });
    // Show all linodes
    expect(c.find('table tbody tr').length).to.equal(2);
  });

  it('shows the BackupSelection when a Linode is clicked', () => {
    const c = shallow(
      <SourceSelection
        distros={api.distributions}
        linodes={api.linodes}
        source={null}
        selectedTab={1}
        onSourceSelected={() => {}}
      />
    );

    c.find('tbody tr td a').simulate('click', { preventDefault() {} });
    expect(c.find('BackupSelection')).to.exist;
  });
});

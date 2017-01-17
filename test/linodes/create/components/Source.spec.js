import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import moment from 'moment';

import Source from '~/linodes/create/components/Source';
import { api } from '@/data';

describe('linodes/create/components/Source', () => {
  const sandbox = sinon.sandbox.create();
  afterEach(() => {
    sandbox.restore();
  });

  it('renders the card header', () => {
    const c = mount(
      <Source
        distributions={api.distributions}
        linodes={api.linodes}
        distribution={null}
        backup={null}
        selectedTab={0}
      />
    );
    expect(c.contains(<h2>Source</h2>)).to.equal(true);
  });

  it('renders the source tabs', () => {
    const tabList = mount(
      <Source
        distributions={api.distributions}
        linodes={api.linodes}
        distribution={null}
        backup={null}
        selectedTab={0}
      />
    ).find('.form-tab-list');

    expect(tabList.children().length).to.equal(4);
    expect(tabList.childAt(0).text()).to.equal('Distributions');
    expect(tabList.childAt(1).text()).to.equal('Backups');
    expect(tabList.childAt(2).text()).to.equal('Clone');
    expect(tabList.childAt(3).text()).to.equal('StackScripts');
  });

  it('invokes the onTabChange function as necessary', () => {
    const onTabChange = sandbox.spy();
    const c = shallow(
      <Source
        distributions={api.distributions}
        linodes={api.linodes}
        distribution={null}
        backup={null}
        selectedTab={0}
        onTabChange={onTabChange}
      />);
    c.find('Tabs').props().onSelect(1);
    expect(onTabChange.calledOnce).to.equal(true);
    expect(onTabChange.calledWith(1)).to.equal(true);
  });

  it('renders Distributions', () => {
    const c = shallow(
      <Source
        distributions={api.distributions.distributions}
        linodes={api.linodes}
        distribution={null}
        backup={null}
        selectedTab={0}
      />);
    expect(c.find('Distributions').length).to.equal(1);
  });

  it('invokes the onSourceSelected function as necessary for Distributions', () => {
    const onSourceSelected = sandbox.spy();
    const c = shallow(
      <Source
        distributions={api.distributions}
        linodes={api.linodes}
        distribution={null}
        backup={null}
        selectedTab={0}
        onSourceSelected={onSourceSelected}
      />
    );
    const distro = api.distributions.distributions.distro_1234;
    c.find('Distributions').props()
     .onSelected(distro);
    expect(onSourceSelected.calledOnce).to.equal(true);
    expect(onSourceSelected.calledWith('distribution', distro)).to.equal(true);
  });

  const moreBackupsLinodes = {
    ...api.linodes,
    linodes: {
      ...api.linodes.linodes,
      1240: {
        ...api.linodes.linodes[1234],
        id: 1240,
        created: moment(api.linodes.linodes[1234].created) + 60,
        label: 'More backups',
      },
    },
  };

  it('renders Linodes', () => {
    const c = shallow(
      <Source
        distributions={api.distributions}
        linodes={moreBackupsLinodes}
        distribution={null}
        backup={null}
        selectedTab={1}
      />
    );

    expect(c.find('table tbody tr').length).to.equal(5);
    // Pagination not shown because the number of rows is less than rowsPerPage(=20)
    expect(c.find('.pagination').length).to.equal(0);
  });

  it('only shows shows n linodes per page of Backups', () => {
    const c = shallow(
      <Source
        distributions={api.distributions}
        linodes={moreBackupsLinodes}
        distribution={null}
        backup={null}
        selectedTab={1}
        onSourceSelected={() => {}}
        perPageLimit={1}
      />
    );

    // Only 1 row
    expect(c.find('table tbody tr').length).to.equal(1);
    // Four buttons (Previous, 1st page, 2nd page, Next)
    expect(c.find('.page-item').length).to.equal(7);
    expect(c.find('.page-item').at(0).text()).to.equal('«');
    expect(c.find('.page-item').at(1).text()).to.equal('1');
    expect(c.find('.page-item').at(2).text()).to.equal('2');
    expect(c.find('.page-item').at(3).text()).to.equal('3');
    expect(c.find('.page-item').at(4).text()).to.equal('4');
    expect(c.find('.page-item').at(5).text()).to.equal('5');
    expect(c.find('.page-item').at(6).text()).to.equal('»');
  });

  it('changes pages when requested', () => {
    const c = shallow(
      <Source
        distributions={api.distributions}
        linodes={moreBackupsLinodes}
        distribution={null}
        backup={null}
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
    expectOnly('test-linode-1233');
    // Previous does nothing
    clickNth(0);
    expectOnly('test-linode-1233');
    // First page does nothing
    clickNth(1);
    expectOnly('test-linode-1233');
    // Second page shows second linode
    clickNth(2);
    expectOnly('test-linode');
    // Third page shows third linode
    clickNth(3);
    expectOnly('More backups');
    // Fourth page shows fourth linode
    clickNth(4);
    expectOnly('test-linode-1245');
    // Fifth page shows fifth linode
    clickNth(5);
    expectOnly('test-linode-1246');
    // Previous goes to previous page
    clickNth(0);
    expectOnly('test-linode-1245');
    // Next goes to last page
    clickNth(5);
    expectOnly('test-linode-1246');
  });

  it('filters backups when updating filter', () => {
    const c = shallow(
      <Source
        distributions={api.distributions}
        linodes={moreBackupsLinodes}
        distribution={null}
        backup={null}
        selectedTab={1}
        onSourceSelected={() => {}}
      />
    );

    // Show all linodes
    expect(c.find('table tbody tr').length).to.equal(5);
    // Filter on 'More'
    c.find('.filter input').simulate('change', { target: { value: 'More' } });
    // Only show 'More backups' linode
    expect(c.find('table tbody tr').length).to.equal(1);
    expect(c.find('tbody tr td').at(0).text()).to.equal('More backups');

    // Reset filter
    c.find('.filter input').simulate('change', { target: { value: '' } });
    // Show all linodes
    expect(c.find('table tbody tr').length).to.equal(5);
  });
});

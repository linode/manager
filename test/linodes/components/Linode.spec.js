import React from 'react';
import sinon from 'sinon';
import moment from 'moment';
import mockdate from 'mockdate';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { Linode, renderBackupStatus } from '~/linodes/components/Linode';
import { testLinode } from '@/data/linodes';

describe('linodes/components/Linode', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders a link to the Linode detail page', () => {
    const linode = shallow(
      <Linode
        linode={testLinode}
        isSelected={false}
      />);

    expect(linode.find('.PrimaryTable-row .PrimaryTable-rowLabel').props().to)
      .to.equal('/linodes/test-linode');
  });

  it('renders the IP addresses', () => {
    const linode = shallow(
      <Linode
        linode={testLinode}
        isSelected={false}
      />);

    expect(linode.find('#ips').contains('97.107.143.99'))
      .to.equal(true);
    expect(linode.find('#ips').contains('2600:3c03::f03c:91ff:fe0a:1dbe'))
      .to.equal(true);
  });

  it('renders the datacenter', () => {
    const datacenter = 'Newark, NJ';
    const linode = shallow(
      <Linode
        linode={testLinode}
        isSelected={false}
      />);

    expect(linode.contains(datacenter))
      .to.equal(true);
    expect(linode.find('.datacenter-style').find('img').props())
      .to.have.property('alt')
      .to.equal(datacenter);
  });

  it('renders the selected class', () => {
    const linode = shallow(
      <Linode
        linode={testLinode}
        isSelected
      />);

    expect(linode.find('.PrimaryTable-row--selected').length).to.equal(1);
  });

  it('invokes the onSelect function when the checkbox is toggled', () => {
    const onSelect = sandbox.spy();
    const linode = mount(
      <Linode
        linode={testLinode}
        isSelected={false}
        onSelect={onSelect}
      />);

    expect(linode.find('input[type="checkbox"]').length).to.equal(1);
    linode.find('input[type="checkbox"]').simulate('change');

    expect(onSelect.calledOnce).to.equal(true);
  });

  describe('renderBackupStatus', () => {
    const linode = {
      id: 1234,
      label: 'test-linode',
      backups: {
        enabled: true,
        last_backup: '2016-07-13T12:30:18',
        schedule: {
          day: 'Monday',
          window: 'W12',
        },
      },
    };

    afterEach(() => {
      mockdate.reset();
    });

    it('renders an enable backups button when disabled', () => {
      const item = shallow(renderBackupStatus({
        ...linode,
        backups: {
          ...linode.backups,
          enabled: false,
        },
      }));
      expect(item.find('Link').length).to.equal(1);
      expect(item.find('Link').props().to)
        .to.equal('/linodes/test-linode/backups');
    });

    it('renders the last backup taken', () => {
      const item = shallow(renderBackupStatus(linode));
      expect(item.find('.backup-status').text()).to.equal(
        `Backup taken ${moment.utc(linode.backups.last_backup).fromNow()}`);
    });

    it('renders the projected time of the first backup', () => {
      const time = '2016-07-13T10:00:00';
      mockdate.set(moment.utc(time));
      const item = shallow(renderBackupStatus({
        ...linode,
        backups: {
          ...linode.backups,
          last_backup: null,
        },
      }));
      expect(item.find('.backup-status').text()).to.equal(
        `Backup in ~${moment('2016-07-13T12:00:00').fromNow(true)}`);
    });

    it('renders the projected time of the first backup when its window is < $NOW', () => {
      const time = '2016-07-13T18:00:00';
      mockdate.set(moment.utc(time));
      const item = shallow(renderBackupStatus({
        ...linode,
        backups: {
          ...linode.backups,
          last_backup: null,
        },
      }));
      expect(item.find('.backup-status').text()).to.equal(
        `Backup in ~${moment('2016-07-14T12:00:00').fromNow(true)}`);
    });

    it('renders running backup', () => {
      const item = shallow(renderBackupStatus({
        ...linode,
        backups: {
          ...linode.backups,
          last_backup: {
            create_dt: '2015-10-06T00:27:08',
            duration: 0,
            finish_dt: '2015-10-06T01:09:08',
            id: 26083011,
            status: 'running',
            type: 'auto',
          },
        },
      }));

      expect(item.find('.backup-status').text()).to.equal('Backup running');
    });

    it('renders pending backup', () => {
      const item = shallow(renderBackupStatus({
        ...linode,
        backups: {
          ...linode.backups,
          last_backup: {
            create_dt: '2015-10-06T00:27:08',
            duration: 0,
            finish_dt: '2015-10-06T01:09:08',
            id: 26083011,
            status: 'pending',
            type: 'auto',
          },
        },
      }));

      expect(item.find('.backup-status').text()).to.equal('Backup pending');
    });
  });
});

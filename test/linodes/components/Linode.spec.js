import React from 'react';
import sinon from 'sinon';
import moment from 'moment';
import mockdate from 'mockdate';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { Linode, renderBackupStatus } from '~/linodes/components/Linode';
import { testLinode } from '~/../test/data';

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

    expect(linode.find('Link.linode-label').props())
      .to.have.property('to')
      .which.equals('/linodes/linode_1234');
  });

  it('renders the IP addresses', () => {
    const linode = shallow(
      <Linode
        linode={testLinode}
        isSelected={false}
        isRow={false}
      />);

    expect(linode.contains(<span>97.107.143.56</span>))
      .to.equal(true);
    expect(linode.contains(<span>2600:3c03::f03c:91ff:fe96:43e7</span>))
      .to.equal(true);
  });

  it('renders the datacenter', () => {
    const datacenter = 'Newark, NJ';
    const linode = shallow(
      <Linode
        linode={testLinode}
        isSelected={false}
        isRow={false}
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

    expect(linode.find('.linode').props().className)
      .to.contain('selected');
  });

  it('renders the row view', () => {
    const linode = shallow(
      <Linode
        linode={testLinode}
        isSelected={false}
      />);

    expect(linode.find('tr').props().className)
      .to.contain('linode')
      .and.contain('row');
  });

  it('invokes the onSelect function when the checkbox is toggled', () => {
    const onSelect = sandbox.spy();
    const linode = shallow(
      <Linode
        linode={testLinode}
        isSelected={false}
        onSelect={onSelect}
        isRow={false}
      />);

    expect(linode.find('input[type="checkbox"]').length).to.equal(1);
    linode.find('input[type="checkbox"]').simulate('change');

    expect(onSelect.calledOnce).to.equal(true);
  });

  it('invokes the onReboot function when the button is pressed', () => {
    const onReboot = sandbox.spy();
    const linode = shallow(
      <Linode
        linode={testLinode}
        isSelected={false}
        onReboot={onReboot}
      />);

    linode.find('.linode-power').simulate('click');

    expect(onReboot.calledOnce).to.equal(true);
  });

  it('invokes the onPowerOn function when the button is pressed', () => {
    const onPowerOn = sandbox.spy();
    const testLinodeOff = { ...testLinode, state: 'offline' };
    const linode = shallow(
      <Linode
        linode={testLinodeOff}
        isSelected={false}
        onPowerOn={onPowerOn}
      />);

    linode.find('.linode-power').simulate('click');

    expect(onPowerOn.calledOnce).to.equal(true);
  });

  describe('renderBackupStatus', () => {
    const linode = {
      id: 'linode_1234',
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
      expect(item.find('Link')).to.exist;
      expect(item.find('Link').props().to)
        .to.equal('/linodes/linode_1234/backups');
    });

    it('renders the last backup taken', () => {
      const item = shallow(renderBackupStatus(linode));
      expect(item.contains(<span className="backup-status">
        Last backup taken {moment.utc(linode.backups.last_backup).fromNow()}
      </span>)).to.equal(true);
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
      expect(item.find('span').text()).to.equal(
        `Auto backup in ~${moment('2016-07-13T12:00:00').fromNow(true)}`);
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
      expect(item.find('span').text()).to.equal(
        `Auto backup in ~${moment('2016-07-14T12:00:00').fromNow(true)}`);
    });
  });
});

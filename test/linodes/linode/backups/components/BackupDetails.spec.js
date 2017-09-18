import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import TimeDisplay from '~/components/TimeDisplay';
import BackupDetails from '~/linodes/linode/backups/components/BackupDetails';

import { testLinode } from '@/data/linodes';


describe('linodes/linode/backups/components/BackupDetails', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders fields', () => {
    const backup = testLinode._backups.daily;
    const page = mount(
      <BackupDetails
        dispatch={dispatch}
        linode={testLinode}
        backup={backup}
      />
    );

    // No label should render if the backup doesn't have a label set
    const label = page.find('#label');
    expect(label.length).to.equal(0);

    const renderTime = (time) =>
      mount(<TimeDisplay time={time} />).text();

    const started = page.find('#started');
    expect(started.text()).to.equal(renderTime(backup.created));

    const finished = page.find('#finished');
    expect(finished.text()).to.equal(renderTime(backup.finished));

    const duration = page.find('#duration');
    expect(duration.text()).to.equal('(1 minute)');

    const region = page.find('#region');
    expect(region.text()).to.equal('us-east-1a');

    const configs = page.find('#configs');
    expect(configs.text()).to.equal('Ubuntu Disk');

    const disks = page.find('#disks');
    expect(disks.text()).to.contain('Ubuntu 15.10 Disk (ext4) - 2330MB');
    expect(disks.text()).to.contain('512 MB Swap Image (swap) - 0MB');

    const space = page.find('#space');
    expect(space.text()).to.equal('2330MB');
  });

  it('renders label if label exists', () => {
    const page = shallow(
      <BackupDetails
        dispatch={dispatch}
        linode={testLinode}
        backup={testLinode._backups.snapshot.current}
      />
    );

    const label = page.find('#label');
    expect(label.text()).to.equal('the label');
  });
});

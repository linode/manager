import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import TimeDisplay from '~/components/TimeDisplay';
import BackupDetails from '~/linodes/linode/backups/components/BackupDetails';

import { testLinode } from '~/data/linodes';


describe('linodes/linode/backups/components/BackupDetails', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it.skip('renders fields', () => {
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
    expect(label.length).toBe(0);

    const renderTime = (time) =>
      mount(<TimeDisplay time={time} />).text();

    const started = page.find('#started');
    expect(started.text()).toBe(renderTime(backup.created));

    const finished = page.find('#finished');
    expect(finished.text()).toBe(renderTime(backup.finished));

    const duration = page.find('#duration');
    expect(duration.text()).toBe('(1 minute)');

    const region = page.find('#region');
    expect(region.text()).toBe('us-east');

    const configs = page.find('#configs');
    expect(configs.text()).toBe('Ubuntu Disk');

    const disks = page.find('#disks');
    expect(disks.text()).to.contain('Ubuntu 15.10 Disk (ext4) - 2330MB');
    expect(disks.text()).to.contain('512 MB Swap Image (swap) - 0MB');

    const space = page.find('#space');
    expect(space.text()).toBe('2330MB');
  });

  it.skip('renders label if label exists', () => {
    const page = shallow(
      <BackupDetails
        dispatch={dispatch}
        linode={testLinode}
        backup={testLinode._backups.snapshot.current}
      />
    );

    const label = page.find('#label');
    expect(label.text()).toBe('the label');
  });
});

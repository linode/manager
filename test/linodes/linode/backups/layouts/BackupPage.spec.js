import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import { expectRequest } from '@/common';

import { api } from '@/data';
import { BackupPage } from '~/linodes/linode/backups/layouts/BackupPage';

describe('linodes/linode/backups/layouts/BackupPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders fields', () => {
    const page = shallow(
      <BackupPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{
          linodeLabel: 'test-linode',
          backupId: '54782214',
        }}
      />
    );

    const restoreTo = page.find('select');
    expect(restoreTo.length).to.equal(1);
    expect(restoreTo.props().value).to.equal(1234);

    const options = restoreTo.find('option');
    expect(options.length).to.equal(Object.keys(api.linodes.linodes).length);

    expect(options.at(0).text()).to.equal('This Linode');
    expect(options.at(0).props().value).to.equal(1234);

    expect(page.find('input[name="overwrite"]').props().value).to.equal(false);

    // No label should render if the backup doesn't have a label set
    const label = page.find('.LinodesLinodeBackupsBackupPage-label');
    expect(label.length).to.equal(0);

    const started = page.find('.LinodesLinodeBackupsBackupPage-started');
    expect(started.text()).to.equal('2017-01-31 07:28:52');

    const finished = page.find('.LinodesLinodeBackupsBackupPage-finished');
    expect(finished.text()).to.equal('2017-01-31 07:30:03');

    const duration = page.find('.LinodesLinodeBackupsBackupPage-duration');
    expect(duration.text()).to.equal('(1 minute)');

    const datacenter = page.find('.LinodesLinodeBackupsBackupPage-datacenter');
    expect(datacenter.text()).to.equal('Newark, NJ');

    const configs = page.find('.LinodesLinodeBackupsBackupPage-configs');
    expect(configs.text()).to.equal('Ubuntu Disk');

    const disks = page.find('.LinodesLinodeBackupsBackupPage-disks');
    expect(disks.text()).to.contain('Ubuntu 15.10 Disk (ext4) - 2330MB');
    expect(disks.text()).to.contain('512 MB Swap Image (swap) - 0MB');

    const space = page.find('.LinodesLinodeBackupsBackupPage-space');
    expect(space.text()).to.equal('2330MB');
  });

  it('renders label if label exists', () => {
    const page = shallow(
      <BackupPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{
          linodeLabel: 'test-linode',
          backupId: '54782236',
        }}
      />
    );

    const label = page.find('.LinodesLinodeBackupsBackupPage-label');
    expect(label.text()).to.equal('the label');
  });

  it('does not show take snapshot button for an auto backup', () => {
    const page = shallow(
      <BackupPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{
          linodeLabel: 'test-linode',
          backupId: '54782214',
        }}
      />
    );

    const takeSnapshot = page.find('button[name="takeSnapshot"]');
    expect(takeSnapshot.length).to.equal(0);
  });

  it('should dispatch a snapshot request', async () => {
    const page = shallow(
      <BackupPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{
          linodeLabel: 'test-linode',
          backupId: '54782236',
        }}
      />
    );

    const takeSnapshot = page.find('button[name="takeSnapshot"]');
    expect(takeSnapshot.length).to.equal(1);

    dispatch.reset();
    takeSnapshot.simulate('click');

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1234/backups', { method: 'POST' });
  });

  it('should dispatch a restore request', async () => {
    const page = shallow(
      <BackupPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{
          linodeLabel: 'test-linode',
          backupId: '54782214',
        }}
      />
    );

    const overwriteVal = page.find('input[name="overwrite"]').props().value;
    const restoreToVal = page.find('select').props().value;

    dispatch.reset();
    page.find('button[name="restore"]').simulate('click');

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1234/backups/54782214/restore', {
      method: 'POST',
      body: {
        linode: restoreToVal,
        overwrite: overwriteVal,
      },
    });

    expect(dispatch.calledWith(push('/linodes/test-linode'))).to.equal(true);
  });

  it('renders errors when restore fails', async () => {
    const errorDispatch = sandbox.stub().throws({
      json() {
        return {
          errors: [
            { reason: 'Nooo!' },
          ],
        };
      },
    });

    const page = mount(
      <BackupPage
        dispatch={errorDispatch}
        linodes={api.linodes}
        params={{
          linodeLabel: 'test-linode',
          backupId: '54782214',
        }}
      />
    );

    await page.instance().restore();

    const errorOutput = page.find('.alert-danger');
    expect(errorOutput.length).to.equal(1);
    expect(errorOutput.text()).to.equal('Nooo!');
  });

  it('renders errors when take snapshot fails', async () => {
    const errorDispatch = sandbox.stub().throws({
      json() {
        return {
          errors: [
            { reason: 'Nooo!' },
          ],
        };
      },
    });

    const page = mount(
      <BackupPage
        dispatch={errorDispatch}
        linodes={api.linodes}
        params={{
          linodeLabel: 'test-linode',
          backupId: '54782236',
        }}
      />
    );

    await page.instance().takeSnapshot();

    const errorOutput = page.find('.alert-danger');
    expect(errorOutput.length).to.equal(1);
    expect(errorOutput.text()).to.equal('Nooo!');
  });
});

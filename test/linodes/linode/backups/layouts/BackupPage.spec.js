import React from 'react';
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
          linodeId: '1234',
          backupId: '54778593',
        }}
      />
    );

    const restoreTo = page.find('select');
    expect(restoreTo.length).to.equal(1);
    expect(restoreTo.props().value).to.equal('1234');

    const options = restoreTo.find('option');
    expect(options.length).to.equal(Object.keys(api.linodes.linodes).length);

    expect(options.at(0).text()).to.equal('This Linode');
    expect(options.at(0).props().value).to.equal(1234);

    expect(page.find('input[name="overwrite"]').props().value).to.equal(false);

    // No label should render if the backup doesn't have a label set
    const label = page.find('.LinodesLinodeBackupsBackupPage-label');
    expect(label.length).to.equal(0);

    const started = page.find('.LinodesLinodeBackupsBackupPage-started');
    expect(started.text()).to.equal('2016-06-09 15:05:55');

    const finished = page.find('.LinodesLinodeBackupsBackupPage-finished');
    expect(finished.text()).to.equal('2016-06-09 15:06:55');

    const duration = page.find('.LinodesLinodeBackupsBackupPage-duration');
    expect(duration.text()).to.equal('(1 minute)');

    const datacenter = page.find('.LinodesLinodeBackupsBackupPage-datacenter');
    expect(datacenter.text()).to.equal('Newark, NJ');

    const configs = page.find('.LinodesLinodeBackupsBackupPage-configs');
    expect(configs.text()).to.equal('Some config');

    const disks = page.find('.LinodesLinodeBackupsBackupPage-disks');
    expect(disks.text()).to.contain('root (ext4) - 2048MB');
    expect(disks.text()).to.contain('swap (swap) - 1024MB');

    const space = page.find('.LinodesLinodeBackupsBackupPage-space');
    expect(space.text()).to.equal('3072MB');
  });

  it('renders label if label exists', () => {
    const page = shallow(
      <BackupPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{
          linodeId: '1234',
          backupId: '54778596',
        }}
      />
    );

    const label = page.find('.LinodesLinodeBackupsBackupPage-label');
    expect(label.text()).to.equal('Some snapshot');
  });

  it('does not show take snapshot button for an auto backup', () => {
    const page = shallow(
      <BackupPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{
          linodeId: '1234',
          backupId: '54778593',
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
          linodeId: '1234',
          backupId: '54778596',
        }}
      />
    );

    const takeSnapshot = page.find('button[name="takeSnapshot"]');
    expect(takeSnapshot.length).to.equal(1);

    dispatch.reset();
    takeSnapshot.simulate('click');

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1234/backups', () => {}, null,
      d => expect(d.method).to.equal('POST')
    );
  });

  it('should dispatch a restore request', async () => {
    const page = shallow(
      <BackupPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{
          linodeId: '1234',
          backupId: '54778593',
        }}
      />
    );

    const overwriteVal = page.find('input[name="overwrite"]').props().value;
    const restoreToVal = page.find('select').props().value;

    dispatch.reset();
    page.find('button[name="restore"]').simulate('click');

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1234/backups/54778593/restore',
      () => {}, null, d => {
        expect(d.method).to.equal('POST');
        expect(d.body).to.equal(JSON.stringify({
          linode: restoreToVal,
          overwrite: overwriteVal,
        }));
      },
    );
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
          linodeId: '1234',
          backupId: '54778593',
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
          linodeId: '1234',
          backupId: '54778596',
        }}
      />
    );

    await page.instance().takeSnapshot();

    const errorOutput = page.find('.alert-danger');
    expect(errorOutput.length).to.equal(1);
    expect(errorOutput.text()).to.equal('Nooo!');
  });
});

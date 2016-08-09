import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import Backup from '~/linodes/components/Backup';
import { testLinode } from '~/../test/data';

describe('linodes/components/Backup', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const testBackup = testLinode._backups.backups.backup_54778593;

  it('renders a Backup', () => {
    const backup = mount(
      <Backup
        backup={testBackup}
        selected={false}
        onSelect={() => {}}
      />
    );

    expect(backup.find(<div className="title">06/09/2016</div>)).to.exist;
    expect(backup.find('<div>Thursday, June 9 2016 3:05 PM</div>')).to.exist;
  });

  it('renders a Backup pending', () => {
    testBackup.status = 'pending';
    const backup = mount(
      <Backup
        backup={testBackup}
        selected={false}
        onSelect={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('Backup pending');
  });

  it('renders a Backup running', () => {
    testBackup.status = 'running';
    const backup = mount(
      <Backup
        backup={testBackup}
        selected={false}
        onSelect={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('Backup running');
  });

  it('renders a Backup failed', () => {
    testBackup.status = 'failed';
    const backup = mount(
      <Backup
        backup={testBackup}
        selected={false}
        onSelect={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('Backup failed');
  });

  it('renders a Backup user aborted', () => {
    testBackup.status = 'userAborted';
    const backup = mount(
      <Backup
        backup={testBackup}
        selected={false}
        onSelect={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('User aborted backup');
  });

  it('renders a Backup post processing', () => {
    testBackup.status = 'needsPostProcessing';
    const backup = mount(
      <Backup
        backup={testBackup}
        selected={false}
        onSelect={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('Awaiting integration');
  });
});

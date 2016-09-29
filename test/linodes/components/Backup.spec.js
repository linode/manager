import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import Backup from '~/linodes/components/Backup';
import { testLinode } from '@/data/linodes';

describe('linodes/components/Backup', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const testBackup = testLinode._backups.backups[54778593];

  it('renders a Backup', () => {
    const backup = mount(
      <Backup
        backup={testBackup}
        selected={testBackup.id}
        future={false}
        onSelect={() => {}}
        title={'Daily'}
      />
    );

    expect(backup.find('.title').text()).to.equal('Daily');
    expect(backup.find('.content-col').text()).to.equal('Thursday, June 9 2016 3:05 PM');
  });

  it('renders a Backup pending', () => {
    const backup = mount(
      <Backup
        backup={{ ...testBackup, status: 'pending' }}
        selected={testBackup.id}
        future={false}
        onSelect={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('Backup pending');
  });

  it('renders a Backup running', () => {
    const backup = mount(
      <Backup
        backup={{ ...testBackup, status: 'running' }}
        selected={testBackup.id}
        future={false}
        onSelect={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('Backup running');
  });

  it('renders a Backup failed', () => {
    const backup = mount(
      <Backup
        backup={{ ...testBackup, status: 'failed' }}
        selected={testBackup.id}
        future={false}
        onSelect={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('Backup failed');
  });

  it('renders a Backup user aborted', () => {
    const backup = mount(
      <Backup
        backup={{ ...testBackup, status: 'userAborted' }}
        selected={testBackup.id}
        future={false}
        onSelect={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('User aborted backup');
  });

  it('renders a Backup post processing', () => {
    const backup = mount(
      <Backup
        backup={{ ...testBackup, status: 'needsPostProcessing' }}
        selected={testBackup.id}
        future={false}
        onSelect={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('Backup running');
  });
});

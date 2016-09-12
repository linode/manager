import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { Backup } from '~/linodes/components/Backup';
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
        linode={testLinode}
        selected={false}
        onSelect={() => {}}
        dispatch={() => {}}
      />
    );

    expect(backup.find(<div className="title">06/09/2016</div>)).to.exist;
    expect(backup.find('<div>Thursday, June 9 2016 3:05 PM</div>')).to.exist;
  });

  it('renders a Backup pending', () => {
    const backup = mount(
      <Backup
        backup={{ ...testBackup, status: 'pending' }}
        linode={testLinode}
        selected={false}
        onSelect={() => {}}
        dispatch={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('Backup pending');
  });

  it('renders a Backup running', () => {
    const backup = mount(
      <Backup
        backup={{ ...testBackup, status: 'running' }}
        linode={testLinode}
        selected={false}
        onSelect={() => {}}
        dispatch={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('Backup running');
  });

  it('renders a Backup failed', () => {
    const backup = mount(
      <Backup
        backup={{ ...testBackup, status: 'failed' }}
        linode={testLinode}
        selected={false}
        onSelect={() => {}}
        dispatch={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('Backup failed');
  });

  it('renders a Backup user aborted', () => {
    const backup = mount(
      <Backup
        backup={{ ...testBackup, status: 'userAborted' }}
        linode={testLinode}
        selected={false}
        onSelect={() => {}}
        dispatch={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('User aborted backup');
  });

  it('renders a Backup post processing', () => {
    const backup = mount(
      <Backup
        backup={{ ...testBackup, status: 'needsPostProcessing' }}
        linode={testLinode}
        selected={false}
        onSelect={() => {}}
        dispatch={() => {}}
      />
    );

    expect(backup.find('.content-col').text()).to.equal('Backup running');
  });
});

import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { RestorePanel } from '~/linodes/linode/backups/components/RestorePanel';
import { actions } from '~/api/configs/linodes';
import { expectRequest } from '@/common';
import { api } from '@/data';
import { testLinode } from '@/data/linodes';
const { linodes } = api;

describe('linodes/linode/backups/components/RestorePanel', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders restore backup selector', () => {
    const panel = mount(
      <RestorePanel
        params={{ linodeId: '1239' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('.restore-backup')
      .at(0)
      .find('select').length)
      .to.equal(1);
  });

  it('renders restore destroy all checkbox', () => {
    const panel = mount(
      <RestorePanel
        params={{ linodeId: '1239' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('.destroy-current')
      .at(0)
      .find('input')
      .props())
      .to.have.property('type')
      .which.equals('checkbox');
    expect(panel.find('.destroy-current')
      .at(0)
      .text())
      .to.equal('Destroy all current disks and backups');
  });

  it('renders restore button', () => {
    const panel = mount(
      <RestorePanel
        params={{ linodeId: '1239' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('.restore-button')
      .at(0)
      .find('button')
      .at(0)
      .text())
      .to.equal('Restore');
  });
});

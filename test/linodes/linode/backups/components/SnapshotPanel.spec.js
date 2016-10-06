import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { SnapshotPanel } from '~/linodes/linode/backups/components/SnapshotPanel';
import { actions } from '~/api/configs/linodes';
import { expectRequest } from '@/common';
import { api } from '@/data';
import { testLinode } from '@/data/linodes';
const { linodes } = api;

describe('linodes/linode/backups/components/SnapshotPanel', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders snapshot button', () => {
    const panel = mount(
      <SnapshotPanel />
    );

    expect(panel.find('.snapshot-button')
      .at(0)
      .find('button')
      .at(0)
      .text())
      .to.equal('Take Snapshot');
  });
});

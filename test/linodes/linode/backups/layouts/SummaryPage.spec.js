import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { expectRequest } from '@/common';
import { api } from '@/data';
import { SummaryPage } from '~/linodes/linode/backups/layouts/SummaryPage';

describe('linodes/linode/backups/layouts/SummaryPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders backup blocks with no backups present', () => {
    const page = shallow(
      <SummaryPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{ linodeLabel: 'test-linode-2' }}
      />
    );

    const blocks = page.find('.Backup');
    expect(blocks.length).to.equal(4);

    const testBlock = (block, title, description) => {
      expect(block.find('.Backup-title').text()).to.equal(title);
      expect(block.find('.Backup-description').text()).to.contain(description);
    };

    testBlock(blocks.at(0), 'Daily', 'Pending');
    testBlock(blocks.at(1), 'Weekly', 'Pending');
    testBlock(blocks.at(2), 'Biweekly', 'Pending');

    expect(blocks.at(3).find('.Backup-title').text()).to.equal('Snapshot');
    expect(blocks.at(3).find('.Backup-description').text()).to.equal(
      'No snapshots taken');
  });

  it('renders backup blocks with all backups present', () => {
    const page = shallow(
      <SummaryPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{ linodeLabel: 'test-linode-1' }}
      />
    );

    const blocks = page.find('.Backup');
    expect(blocks.length).to.equal(4);

    const testBlock = (block, title, description, id) => {
      expect(block.find('Link').props().to).to.equal(
        `/linodes/test-linode-1/backups/${id}`);
      expect(block.find('.Backup-title').text()).to.equal(title);
      expect(block.find('.Backup-description').text()).to.contain(description);
    };

    testBlock(blocks.at(0), 'Daily', 'day', '54782214');
    testBlock(blocks.at(1), 'Weekly', 'day', '54782216');
    testBlock(blocks.at(2), 'Biweekly', 'day', '54782217');
    testBlock(blocks.at(3), 'Snapshot', 'day', '54782236');
  });

  it('takes a snapshot', async () => {
    const page = shallow(
      <SummaryPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{ linodeLabel: 'test-linode-2' }}
      />
    );

    const takeSnapshot = page.find('.Backup').at(3).find('Button');
    expect(takeSnapshot.length).to.equal(1);

    dispatch.reset();
    takeSnapshot.simulate('click');

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1236/backups', { method: 'POST' });
  });
});

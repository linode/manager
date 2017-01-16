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

    const blocks = page.find('.backup-block');
    expect(blocks.length).to.equal(4);

    const testBlock = (block, title, description) => {
      expect(block.find('.title').text()).to.equal(title);
      expect(block.find('.description').text()).to.contain(description);
    };

    testBlock(blocks.at(0), 'Daily', 'Pending');
    testBlock(blocks.at(1), 'Weekly', 'Pending');
    testBlock(blocks.at(2), 'Biweekly', 'Pending');

    expect(blocks.at(3).find('.title').text()).to.equal('Snapshot');
    expect(blocks.at(3).find('.no-snapshot').text()).to.equal(
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

    const blocks = page.find('.backup-block');
    expect(blocks.length).to.equal(4);

    const testBlock = (block, title, description, id) => {
      expect(block.parent().props().to).to.equal(
        `/linodes/test-linode-1/backups/${id}`);
      expect(block.find('.title').text()).to.equal(title);
      expect(block.find('.description').text()).to.contain(description);
    };

    testBlock(blocks.at(0), 'Daily', 'days', '54778593');
    testBlock(blocks.at(1), 'Weekly', 'days', '54778594');
    testBlock(blocks.at(2), 'Biweekly', 'days', '54778595');
    testBlock(blocks.at(3), 'Snapshot', 'days', '54778596');
  });

  it('takes a snapshot', async () => {
    const page = shallow(
      <SummaryPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{ linodeLabel: 'test-linode-2' }}
      />
    );

    const takeSnapshot = page.find('.backup-block').at(3).find('Button');
    expect(takeSnapshot.length).to.equal(1);

    dispatch.reset();
    takeSnapshot.simulate('click');

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1236/backups', () => {}, null,
      d => expect(d.method).to.equal('POST')
    );
  });
});

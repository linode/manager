import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

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
        params={{ linodeId: '1236' }}
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
    testBlock(blocks.at(3), 'Snapshot', 'Pending');
  });

  it('renders backup blocks with all backups present', () => {
    const page = shallow(
      <SummaryPage
        dispatch={dispatch}
        linodes={api.linodes}
        params={{ linodeId: '1235' }}
      />
    );

    const blocks = page.find('.backup-block');
    expect(blocks.length).to.equal(4);

    const testBlock = (block, title, description, id) => {
      expect(block.parent().props().to).to.equal(
        `/linodes/1235/backups/${id}`);
      expect(block.find('.title').text()).to.equal(title);
      expect(block.find('.description').text()).to.contain(description);
    };

    testBlock(blocks.at(0), 'Daily', 'days', '54778593');
    testBlock(blocks.at(1), 'Weekly', 'days', '54778594');
    testBlock(blocks.at(2), 'Biweekly', 'days', '54778595');
    testBlock(blocks.at(3), 'Snapshot', 'days', '54778596');
  });
});

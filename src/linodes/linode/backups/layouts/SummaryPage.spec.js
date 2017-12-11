import { mount, shallow } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { TimeDisplay } from '~/components';
import { SummaryPage } from '~/linodes/linode/backups/layouts/SummaryPage';

import { expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest } from '~/test.helpers';
import { testLinode, testLinode1235, testLinode1236 } from '~/data/linodes';


describe('linodes/linode/backups/layouts/SummaryPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode1236}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it.skip('renders backup blocks with no backups present', () => {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode1236}
      />
    );

    const blocks = page.find('.Backup');
    expect(blocks.length).toBe(4);

    const testBlock = (block, title, description) => {
      expect(block.find('.Backup-title').text()).toBe(title);
      expect(block.find('.Backup-description').text()).to.contain(description);
    };

    testBlock(blocks.at(0), 'Daily', 'Pending');
    testBlock(blocks.at(1), 'Weekly', 'Pending');
    testBlock(blocks.at(2), 'Biweekly', 'Pending');

    expect(blocks.at(3).find('.Backup-title').text()).toBe('Snapshot');
    expect(blocks.at(3).find('.Backup-description').text()).toBe(
      'No snapshots taken');
  });

  it.skip('renders backup blocks with all backups present', () => {
    const { daily, weekly, snapshot } = testLinode1235._backups;
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode1235}
      />
    );

    const blocks = page.find('.Backup');
    expect(blocks.length).toBe(4);

    const renderTime = (time) =>
      mount(<TimeDisplay time={time} />).text();

    const testBlock = (block, title, time, id) => {
      expect(block.find('Link').props().to).toBe(
        `/linodes/test-linode-1/backups/${id}`);
      expect(block.find('.Backup-title').text()).toBe(title);
      expect(block.find('.Backup-description').text()).to.contain(renderTime(time));
    };

    testBlock(blocks.at(0), 'Daily', daily.finished, '54782214');
    testBlock(blocks.at(1), 'Weekly', weekly[0].finished, '54782216');
    testBlock(blocks.at(2), 'Biweekly', weekly[1].finished, '54782217');
    testBlock(blocks.at(3), 'Snapshot', snapshot.current.finished, '54782236');
  });

  it.skip('takes a snapshot', async () => {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode1236}
      />
    );

    dispatch.reset();
    page.find('Form').props().onSubmit({ preventDefault() { } });
    expect(dispatch.callCount).toBe(1);

    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('Form').props().onSubmit();
    expect(dispatch.callCount).toBe(1);

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1236/backups', { method: 'POST' }),
      ([pushResult]) => expectObjectDeepEquals(
        pushResult, push(`/linodes/${testLinode1236.label}/backups/1`)),
    ], 2, [{ id: '1' }]);
  });

  it.skip('does not show take snapshot button for an auto backup', () => {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    const takeSnapshot = page.find('button[name="takeSnapshot"]');
    expect(takeSnapshot.length).toBe(0);
  });
});

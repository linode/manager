import React from 'react';
import sinon from 'sinon';
import { push } from 'react-router-redux';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import * as fetch from '~/fetch';
import { testLinode } from '~/../test/data';
import * as BackupsPageWrapper from '~/linodes/layouts/BackupsPage';
import { UPDATE_LINODE } from '~/actions/api/linodes';
import * as actions from '~/linodes/actions/detail/backups';
import { SHOW_MODAL, hideModal } from '~/actions/modal';
import { SET_ERROR } from '~/actions/errors';

const {
  BackupsPage,
} = BackupsPageWrapper;

describe('linodes/layouts/BackupsPage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const linodes = {
    pagesFetched: [0],
    totalPages: 1,
    linodes: {
      [testLinode.id]: testLinode,
      linode_1235: {
        ...testLinode,
        id: 'linode_1235',
        backups: { enabled: true },
      },
    },
    _singular: 'linode',
    _plural: 'linodes',
  };

  const backups = {
    selectedBackup: null,
    targetLinode: '',
    timeOfDay: '0000-0200',
    dayOfWeek: 'sunday',
  };

  it('fetches a linode when mounted with an unknown linode', async () => {
    mount(
      <BackupsPage
        dispatch={dispatch}
        linodes={{ linodes: { } }}
        params={{ linodeId: 'linode_1234' }}
        backups={backups}
      />);
    expect(dispatch.calledTwice).to.equal(true);
    const dispatched = dispatch.firstCall.args[0];
    // Assert that dispatched is a function that fetches a linode
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => {},
    });
    dispatch.reset();
    await dispatched(dispatch, () => ({
      authentication: { token: 'token' },
    }));
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[1]).to.equal('/linodes/linode_1234');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0].type).to.equal(UPDATE_LINODE);
  });

  it('does not fetch when mounted with a known linode', () => {
    mount(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: testLinode.id }}
        backups={backups}
      />);
    expect(dispatch.calledTwice).to.equal(false);
  });

  it('renders the "backups not enabled" UI', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: testLinode.id }}
        backups={backups}
      />);
    expect(page.contains(<p>Backups are not enabled for this Linode.</p>))
      .to.equal(true);
    expect(page.find('button.btn-primary').text())
      .to.equal('Enable backups');
  });

  it('calls enable backups on click', () => {
    const enableLinodeBackup = sinon.stub(BackupsPageWrapper, 'enableLinodeBackup');
    const page = mount(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: testLinode.id }}
        backups={backups}
      />);

    const enableButton = page.find('.btn-primary');
    enableButton.simulate('click');

    expect(enableLinodeBackup.calledOnce).to.equal(true);
    enableLinodeBackup.restore();
  });

  it('calls cancel backups on click', () => {
    const cancelLinodeBackup = sinon.stub(BackupsPageWrapper, 'cancelLinodeBackup');
    const page = mount(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);

    const cancelButton = page.find('.btn-danger-outline');
    cancelButton.simulate('click');

    expect(cancelLinodeBackup.calledOnce).to.equal(true);
    cancelLinodeBackup.restore();
  });

  it('renders the manual backup UI', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
    const manual = page.find('.manual-backups');
    expect(manual).to.exist;
    expect(manual.contains(<h2>Manual Backup</h2>))
      .to.equal(true);
    expect(manual.find('button').props().className)
      .to.equal('btn btn-primary');
    expect(manual.find('button').text())
      .to.equal('Take backup');
  });

  it('requests a manual backup when "Take backup" is pressed');

  it('renders the schedule UI', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
    const schedule = page.find('.backup-schedule');
    expect(schedule).to.exist;
    expect(schedule.find('h2').text())
      .to.equal('Schedule<HelpButton />');
    expect(schedule.find('#schedule')).to.exist;
    expect(schedule.find('#dow')).to.exist;
    expect(schedule.contains(<button className="btn btn-primary">Save</button>))
      .to.equal(true);
    expect(schedule.find('.btn-danger-outline').at(0).text())
      .to.equal('Cancel backups');
  });

  it('dispatches a SET_TIME_OF_DAY action when time of day changes', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
    const schedule = page.find('.backup-schedule');
    dispatch.reset();
    schedule.find('#schedule').simulate('change', { target: { value: '0200-0400' } });
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0])
      .to.deep.equal(actions.setTimeOfDay('0200-0400'));
  });

  it('dispatches a SET_DAY_OF_WEEK action when day of week changes', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
    const schedule = page.find('.backup-schedule');
    dispatch.reset();
    schedule.find('#dow').simulate('change', { target: { value: 'monday' } });
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0])
      .to.deep.equal(actions.setDayOfWeek('monday'));
  });

  it('renders the latest backups', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
    const b = page.find('.backups');
    expect(b.find('.backup').length).to.equal(4);
  });

  it('dispatches a SELECT_BACKUP action when one is clicked', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
    const b = page.find('.backups');
    dispatch.reset();
    b.find('.backup').first().simulate('click');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0])
      .to.deep.equal(actions.selectBackup('backup_54778593'));
  });

  it('dispatches a SELECT_TARGET_LINODE action when "existing linode" is checked', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
    const existing = page.find('.restore')
      .find('input[type="radio"]')
      .last();
    dispatch.reset();
    existing.simulate('change', { target: { checked: true } });
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0])
      .to.deep.equal(actions.selectTargetLinode('linode_1234'));
  });

  it('dispatches a SELECT_TARGET_LINODE action when "existing linode" is unchecked', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
    const existing = page.find('.restore')
      .find('input[type="radio"]')
      .last();
    dispatch.reset();
    existing.simulate('change', { target: { checked: false } });
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0])
      .to.deep.equal(actions.selectTargetLinode(''));
  });

  it('dispatches a SELECT_TARGET_LINODE action when "this linode" is checked', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
    const existing = page.find('.restore')
      .find('input[type="radio"]')
      .at(0);
    dispatch.reset();
    existing.simulate('change', { target: { checked: true } });
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0])
      .to.deep.equal(actions.selectTargetLinode('linode_1235'));
  });

  it('dispatches a SELECT_TARGET_LINODE action when "this linode" is unchecked', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
    const existing = page.find('.restore')
      .find('input[type="radio"]')
      .at(0);
    dispatch.reset();
    existing.simulate('change', { target: { checked: false } });
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0])
      .to.deep.equal(actions.selectTargetLinode(''));
  });

  it('dispatches a SELECT_TARGET_LINODE action when "new linode" is unchecked', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
    const existing = page.find('.restore')
      .find('input[type="radio"]')
      .at(1);
    dispatch.reset();
    existing.simulate('change', { target: { checked: false } });
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0])
      .to.deep.equal(actions.selectTargetLinode('linode_1234'));
  });

  it('dispatches a SELECT_TARGET_LINODE action when "new linode" is checked', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
    const existing = page.find('.restore')
      .find('input[type="radio"]')
      .at(1);
    dispatch.reset();
    existing.simulate('change', { target: { checked: true } });
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0])
      .to.deep.equal(actions.selectTargetLinode(''));
  });

  it('dispatches a SELECT_TARGET_LINODE action when a Linode is selected', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
    const select = page.find('.restore').find('select');
    dispatch.reset();
    select.simulate('change', { target: { value: 'linode_1236' } });
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0])
      .to.deep.equal(actions.selectTargetLinode('linode_1236'));
  });

  it('restores backups when asked to', async () => {
    const page = shallow(<BackupsPage
      dispatch={dispatch}
      linodes={linodes}
      params={{ linodeId: 'linode_1235' }}
      backups={{
        ...backups,
        selectedBackup: 'backup_26',
      }}
    />);
    await page.instance().restore('linode_1234', 'backup_26');
    expect(dispatch.calledTwice);
    expect(dispatch.secondCall.args[0]).to.deep.equal(push('/linodes/linode_1234'));
    const func = dispatch.firstCall.args[0];
    expect(func).to.be.a('function');
    // Assert that func does the needful
    const fetchStub = sandbox.stub(fetch, 'fetch')
      .returns({ json: () => 'asdf' });
    const getState = sinon.stub().returns({ authentication: { token: 'token' } });
    dispatch.reset();
    expect(await func(dispatch, getState)).to.equal('asdf');
    expect(dispatch.callCount).to.equal(0);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.calledWith('token',
      '/linodes/linode_1235/backups/backup_1234/restore'));
    const data = fetchStub.firstCall.args[2];
    expect(data.method).to.equal('POST');
    expect(JSON.parse(data.body)).to.deep.equal({
      linode: 'linode_1234',
      overwrite: false,
    });
  });

  it('handles overwrite errors restoring backups', async () => {
    const _dispatch = sandbox.stub();
    const page = shallow(<BackupsPage
      dispatch={_dispatch}
      linodes={linodes}
      params={{ linodeId: 'linode_1235' }}
      backups={{
        ...backups,
        selectedBackup: 'backup_26',
      }}
    />);
    _dispatch.onCall(0).throws({
      json: () => ({
        errors: [
          {
            reason: 'Not enough unallocated space',
          },
        ],
      }),
    });
    await page.instance().restore('linode_1234', 'backup_26');
    expect(_dispatch.callCount).to.equal(2);
    expect(_dispatch.secondCall.args[0]).to.have.property('type')
      .which.equals(SHOW_MODAL);
  });

  it('handles other kinds of errors restoring backups', async () => {
    const _dispatch = sandbox.stub();
    const page = shallow(<BackupsPage
      dispatch={_dispatch}
      linodes={linodes}
      params={{ linodeId: 'linode_1235' }}
      backups={{
        ...backups,
        selectedBackup: 'backup_26',
      }}
    />);
    _dispatch.onCall(0).throws({
      headers: { get: () => 'application/json' },
      json: () => ({
        errors: [],
      }),
    });
    await page.instance().restore('linode_1234', 'backup_26');
    expect(_dispatch.callCount).to.equal(2);
    const func = _dispatch.secondCall.args[0];
    expect(func).to.be.a('function');
    _dispatch.reset();
    await func(_dispatch);
    expect(_dispatch.firstCall.args[0]).to.have.property('type')
      .which.equals(SET_ERROR);
  });

  it('restores backups when asked to', async () => {
    const page = shallow(<BackupsPage
      dispatch={dispatch}
      linodes={linodes}
      params={{ linodeId: 'linode_1235' }}
      backups={{
        ...backups,
        selectedBackup: 'backup_26',
      }}
    />);
    const restore = sandbox.stub(page.instance(), 'restore');
    page.find('.btn-primary').at(0).simulate('click');
    expect(restore.calledOnce).to.equal(true);
  });

  describe('overwrite modal', () => {
    it('dismisses the modal when cancel is pressed', () => {
      const page = shallow(<BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
      const modal = shallow(
        page.instance().renderModal('linode_1235', 'backup_1234'));
      const cancel = modal.find('.btn-default');
      dispatch.reset();
      cancel.simulate('click');
      expect(dispatch.calledOnce).to.equal(true);
      expect(dispatch.calledWith(hideModal())).to.equal(true);
    });

    it('attempts to restore when continue is clicked', () => {
      const page = shallow(<BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        backups={backups}
      />);
      const restore = sandbox.stub(page.instance(), 'restore');
      const modal = shallow(
        page.instance().renderModal('linode_1235', 'backup_1234'));
      const proceed = modal.find('.btn-primary');
      dispatch.reset();
      proceed.simulate('click');
      expect(dispatch.calledOnce).to.equal(true);
      expect(dispatch.calledWith(hideModal())).to.equal(true);
      expect(restore.calledOnce).to.equal(true);
      expect(restore.calledWith('linode_1235', 'backup_1234', true)).to.equal(true);
    });
  });
});

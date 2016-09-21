import React from 'react';
import sinon from 'sinon';
import { push } from 'react-router-redux';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import * as fetch from '~/fetch';
import { state } from '@/data';
import { testLinode } from '@/data/linodes';
import { BackupsPage } from '~/linodes/linode/layouts/BackupsPage';
import { SHOW_MODAL, hideModal } from '~/actions/modal';
import { SET_ERROR } from '~/actions/errors';
import { expectRequest } from '@/common';

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
      1235: {
        ...testLinode,
        id: 1235,
        backups: { enabled: false },
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
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
    await new Promise(a => setTimeout(a, 0));
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1234');
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
        params={{ linodeId: 1235 }}
        backups={backups}
      />);
    expect(page.contains(<p>Backups are not enabled for this Linode.</p>))
      .to.equal(true);
    expect(page.find('button.btn-primary').text())
      .to.equal('Enable backups');
  });

  it('calls enable backups on click', () => {
    const page = mount(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1235 }}
        backups={backups}
      />);

    const enableLinodeBackup = sandbox.stub(page.instance(), 'enableLinodeBackup');
    const enableButton = page.find('.btn-primary');
    enableButton.simulate('click');

    expect(enableLinodeBackup.calledOnce).to.equal(true);
    enableLinodeBackup.restore();
  });

  it('calls cancel backups on click');

  it('requests a Snapshot when "Take Snapshot" is pressed', async () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={{
          ...linodes,
          linodes: {
            ...linodes.linodes,
            [testLinode.id]: {
              ...testLinode,
              _backups: {
                ...testLinode._backups,
                totalResults: 0,
                backups: { },
              },
            },
          },
        }}
        params={{ linodeId: testLinode.id }}
      />);
    const takeSnapshot = page.find('button.btn-primary-outline');
    dispatch.reset();
    takeSnapshot.simulate('click');
    expect(dispatch.calledOnce).to.equal(true);
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, `/linode/instances/${testLinode.id}/backups`,
      () => {}, null, { method: 'POST' });
  });

  it('renders modal when "Take Snapshot" is pressed and backups exist', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
    const takeSnapshot = page.find('button.btn-primary-outline');
    dispatch.reset();
    takeSnapshot.simulate('click');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0]).to.have.property('type')
      .which.equals(SHOW_MODAL);
  });

  it('requests Snapshot when "Take new snapshot" is pressed from modal', async () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
    const modal = shallow(
      page.instance().renderOverwriteSnapshotModal(testLinode));
    const takeSnapshot = modal.find('button.btn-primary');
    dispatch.reset();
    takeSnapshot.simulate('click');
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1234/backups',
      () => {}, null, { method: 'POST' });
  });

  it('renders the schedule UI', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
    const schedule = page.find('.backup-schedule');
    expect(schedule).to.exist;
    expect(schedule.find('h2').text())
      .to.equal('Schedule<HelpButton />');
    expect(schedule.find('#schedule')).to.exist;
    expect(schedule.find('#dow')).to.exist;
    expect(schedule.find('button.btn-primary')).to.exist;
    expect(schedule.find('button.btn-primary').text())
      .to.equal('Save');
    expect(schedule.find('.btn-danger-outline').at(0).text())
      .to.equal('Cancel backups');
  });

  it('updates state when time of day changes', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
    const schedule = page.find('.backup-schedule');
    schedule.find('#schedule').simulate('change', { target: { value: 'W4' } });
    expect(page.state('schedule'))
      .to.have.property('timeOfDay').that.equals('W4');
  });

  it('updates state when day of week changes', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
    const schedule = page.find('.backup-schedule');
    schedule.find('#dow').simulate('change', { target: { value: 'Wednesday' } });
    expect(page.state('schedule'))
      .to.have.property('dayOfWeek').that.equals('Wednesday');
  });

  it('submits new backup schedule to the API', async () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
    await new Promise(r => setTimeout(r, 0));
    const schedule = page.find('.backup-schedule');
    dispatch.reset();
    schedule.find('.btn-primary').simulate('click');
    await new Promise(r => setTimeout(r, 0));
    expect(dispatch.calledOnce).to.equal(true);
    const func = dispatch.firstCall.args[0];
    expect(func).to.be.a('function');
    dispatch.reset();
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => {},
    });
    await func(dispatch, () => state);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.calledWith('token', '/linode/instances/1234')).to.equal(true);
  });

  it('renders the restore UI', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
    const b = page.find('.backups');
    expect(b.find('Backup').length).to.equal(4);
  });

  it('updates state when a backup is clicked', () => {
    const page = mount(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
    const b = page.find('.backups');
    dispatch.reset();
    b.find('.backup').first().simulate('click');
    expect(page.state('selectedBackup')).to.equal(54778593);
  });

  it('updates state when "existing linode" is checked', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
    const existing = page.find('.restore .radio').last().find('input');
    dispatch.reset();
    existing.simulate('change', { target: { checked: true } });
    expect(page.state('targetLinode')).to.equal(1234);
  });

  it('updates state when "this linode" is checked', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
    const existing = page.find('.restore .radio').at(0).find('input');
    dispatch.reset();
    existing.simulate('change', { target: { checked: true } });
    expect(page.state('targetLinode')).to.equal(1234);
  });

  it('updates state when "new linode" is checked', () => {
    const page = mount(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
    const existing = page.find('.restore .radio').at(1).find('input');
    dispatch.reset();
    existing.simulate('change', { target: { checked: true } });
    expect(page.state('targetLinode')).to.equal('');
  });

  it('updates state when a Linode is selected', () => {
    const page = mount(
      <BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
    const select = page.find('.restore').find('select');
    dispatch.reset();
    select.simulate('change', { target: { value: 1236 } });
    expect(page.state('targetLinode')).to.equal(1236);
  });

  it('restores backups when asked to', async () => {
    const page = mount(<BackupsPage
      dispatch={dispatch}
      linodes={linodes}
      params={{ linodeId: 1234 }}
      backups={{
        ...backups,
        selectedBackup: 26,
      }}
    />);
    await page.instance().restore(1234, 26);
    expect(dispatch.calledTwice);
    expect(dispatch.secondCall.args[0]).to.deep.equal(push('/linodes/1234'));
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
      '/linodes/1234/backups/1234/restore'));
    const data = fetchStub.firstCall.args[2];
    expect(data.method).to.equal('POST');
    expect(JSON.parse(data.body)).to.deep.equal({
      linode: 1234,
      overwrite: false,
    });
  });

  it('redirects to create linode page when necessary', async () => {
    const page = mount(<BackupsPage
      dispatch={dispatch}
      linodes={linodes}
      params={{ linodeId: 1234 }}
      backups={{
        ...backups,
        selectedBackup: 26,
      }}
    />);
    await page.instance().restore('', 26);
    expect(dispatch.calledOnce);
    expect(dispatch.firstCall.args[0]).to.deep.equal(
      push(`/linodes/create?linode=${1234}&backup=${26}`));
  });

  it('handles overwrite errors restoring backups', async () => {
    const _dispatch = sandbox.stub();
    const page = shallow(<BackupsPage
      dispatch={_dispatch}
      linodes={linodes}
      params={{ linodeId: 1234 }}
      backups={{
        ...backups,
        selectedBackup: 26,
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
    await page.instance().restore(1234, 26);
    expect(_dispatch.callCount).to.equal(2);
    expect(_dispatch.secondCall.args[0]).to.have.property('type')
      .which.equals(SHOW_MODAL);
  });

  it('handles other kinds of errors restoring backups', async () => {
    const _dispatch = sandbox.stub();
    const page = shallow(<BackupsPage
      dispatch={_dispatch}
      linodes={linodes}
      params={{ linodeId: 1234 }}
      backups={{
        ...backups,
        selectedBackup: 26,
      }}
    />);
    _dispatch.onCall(0).throws({
      headers: { get: () => 'application/json' },
      json: () => ({
        errors: [],
      }),
    });
    await page.instance().restore(1234, 26);
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
      params={{ linodeId: 1234 }}
      backups={{
        ...backups,
        selectedBackup: 26,
      }}
    />);
    const restore = sandbox.stub(page.instance(), 'restore');
    page.find('.btn-primary').at(0).simulate('click');
    expect(restore.calledOnce).to.equal(true);
  });

  it('renders predicted backups', () => {
    const page = shallow(
      <BackupsPage
        dispatch={dispatch}
        linodes={{
          ...linodes,
          linodes: {
            ...linodes.linodes,
            [testLinode.id]: {
              ...testLinode,
              _backups: {
                ...testLinode._backups,
                totalResults: 0,
                backups: { },
              },
            },
          },
        }}
        params={{ linodeId: testLinode.id }}
      />);
    const futureBackups = page.find('.backups');
    expect(futureBackups).to.exist;
    expect(futureBackups.html()).to.contain('Snapshot');
    expect(futureBackups.html()).to.contain('You haven&#x27;t taken any snapshots yet');
    expect(futureBackups.html()).to.contain('Daily');
    expect(futureBackups.html()).to.contain('Weekly');
    expect(futureBackups.html()).to.contain('Biweekly');
  });

  describe('overwrite modal', () => {
    it('dismisses the modal when cancel is pressed', () => {
      const page = shallow(<BackupsPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
      const modal = shallow(
        page.instance().renderModal(1234, 1234));
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
        params={{ linodeId: 1234 }}
        backups={backups}
      />);
      const restore = sandbox.stub(page.instance(), 'restore');
      const modal = shallow(
        page.instance().renderModal(1234, 1234));
      const proceed = modal.find('.btn-primary');
      dispatch.reset();
      proceed.simulate('click');
      expect(dispatch.calledOnce).to.equal(true);
      expect(dispatch.calledWith(hideModal())).to.equal(true);
      expect(restore.calledOnce).to.equal(true);
      expect(restore.calledWith(1234, 1234, true)).to.equal(true);
    });
  });
});

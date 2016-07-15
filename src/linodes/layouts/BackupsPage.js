import React, { Component, PropTypes } from 'react';
import { push } from 'react-router-redux';
import { fetchLinode, fetchLinodes } from '~/actions/api/linodes';
import { showModal, hideModal } from '~/actions/modal';
import { enableBackup, cancelBackup, fetchBackups } from '~/actions/api/backups';
import {
  selectBackup,
  selectTargetLinode,
  setTimeOfDay,
  setDayOfWeek,
  restoreBackup,
} from '~/linodes/actions/detail/backups';
import { connect } from 'react-redux';
import HelpButton from '~/components/HelpButton';
import { setError } from '~/actions/errors';
import moment, { ISO_8601 } from 'moment';

export class BackupsPage extends Component {
  constructor() {
    super();
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentDidUpdate = this.componentDidMount.bind(this);
    this.getLinode = this.getLinode.bind(this);
    this.enableLinodeBackup = this.enableLinodeBackup.bind(this);
    this.cancelLinodeBackup = this.cancelLinodeBackup.bind(this);
    this.renderCancelBackupModal = this.renderCancelBackupModal.bind(this);
    this.renderNotEnabled = this.renderNotEnabled.bind(this);
    this.renderEnabled = this.renderEnabled.bind(this);
    this.renderSchedule = this.renderSchedule.bind(this);
    this.renderBackup = this.renderBackup.bind(this);
    this.renderBackups = this.renderBackups.bind(this);
    this.renderLastManualBackup = this.renderLastManualBackup.bind(this);
    this.renderModal = this.renderModal.bind(this);
    this.restore = this.restore.bind(this);
    this.state = { loading: false };
  }

  componentDidMount() {
    const { dispatch, linodes } = this.props;
    const linode = this.getLinode();
    if (!linode) {
      const { linodeId } = this.props.params;
      dispatch(fetchLinode(linodeId));
    } else {
      if (linode._backups.totalPages === -1) {
        dispatch(fetchBackups(0, linode.id));
      }
      if (linodes.totalPages === -1) {
        dispatch(fetchLinodes());
      }
    }
  }

  getLinode() {
    const { linodes } = this.props.linodes;
    const { linodeId } = this.props.params;
    return linodes[linodeId];
  }

  async restore(target, backup, override = false) {
    const { dispatch } = this.props;
    const { linodeId } = this.props.params;
    this.setState({ loading: true });
    try {
      await dispatch(restoreBackup(linodeId, target, backup, override));
      dispatch(push(`/linodes/${target}`));
    } catch (response) {
      const json = await response.json();
      if (json.errors && json.errors.length === 1
          && json.errors[0].reason.indexOf('Not enough unallocated space') === 0) {
        dispatch(showModal('Restore backup', this.renderModal(target, backup)));
      } else {
        dispatch(setError(response, json));
      }
    }
  }

  async enableLinodeBackup(linode) {
    const { dispatch } = this.props;
    try {
      await dispatch(enableBackup(linode.id));
    } catch (response) {
      dispatch(setError(response));
    }
  }

  async cancelLinodeBackup(linode) {
    const { dispatch } = this.props;
    try {
      await dispatch(cancelBackup(linode.id));
    } catch (response) {
      dispatch(setError(response));
    }
  }

  renderCancelBackupModal(linode) {
    const { dispatch } = this.props;
    return (
      <div>
        <p>
          <span className="text-danger">WARNING!</span> Your backups will
          immediately and irrevecoably be deleted if you continue.
        </p>
        <div className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={() => {
              this.cancelLinodeBackup(linode);
              dispatch(hideModal());
            }}
          >Cancel backups</button>
          <button
            className="btn btn-default"
            onClick={() => dispatch(hideModal())}
          >Abort</button>
        </div>
      </div>);
  }

  renderBackup(backup) {
    if (!backup) {
      return null;
    }
    const calendar = {
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      lastDay: 'Yesterday',
      lastWeek: 'dddd',
      sameElse: ISO_8601,
    };
    const { dispatch } = this.props;
    const { selectedBackup } = this.props.backups;
    const created = moment(backup.created);
    const cardTitle = created.calendar(null, calendar);
    return (
      <div
        className={`backup ${selectedBackup === backup.id ? 'selected' : ''}`}
        onClick={() => dispatch(selectBackup(backup.id))}
      >
        <h3>{cardTitle}</h3>
        <dl className="dl-horizontal row">
          <dt className="col-sm-2">Date</dt>
          <dd className="col-sm-10">{created.format('dddd, MMMM D YYYY')}</dd>
          <dt className="col-sm-2">Time</dt>
          <dd className="col-sm-10">{created.format('LT')}</dd>
        </dl>
      </div>
    );
  }

  renderModal(target, backup) {
    const { dispatch } = this.props;
    return (
      <div>
        <p>
          <span className="text-danger">WARNING!</span> There is not enough
          unallocated disk space left on this Linode to continue with this
          restore. Confirm below to erase all disks from the Linode or go
          back and select another Linode.
        </p>
        <div className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={() => {
              this.restore(target, backup, true);
              dispatch(hideModal());
            }}
          >Erase and restore</button>
          <button
            className="btn btn-default"
            onClick={() => dispatch(hideModal())}
          >Cancel</button>
        </div>
      </div>);
  }

  renderBackups() {
    const backups = Object.values(this.getLinode()._backups.backups);
    if (backups.length === 0) {
      return (
        <p>
          No backups yet.
          First automated backup is scheduled for {'8 hours'/* TODO */} from now.
        </p>
      );
    }
    const { selectedBackup, targetLinode } = this.props.backups;
    const { linodes, dispatch } = this.props;
    const thisLinode = this.getLinode();
    return (
      <div>
        <div className="row backups">
          {backups.map(b =>
            <div className="col-md-3">
              {this.renderBackup(b)}
            </div>
          )}
        </div>
        <div className="row restore">
          <div className="col-md-1">
            Restore to:
          </div>
          <div className="col-md-4">
            <div className="radio">
              <label>
                <input
                  type="radio"
                  name="restore-target"
                  checked={targetLinode === thisLinode.id}
                  onChange={e =>
                    dispatch(e.target.checked
                      ? selectTargetLinode(thisLinode.id)
                      : selectTargetLinode(''))
                  }
                />
                <span>This Linode</span>
              </label>
            </div>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  name="restore-target"
                  checked={targetLinode === ''}
                  onChange={e =>
                    dispatch(e.target.checked
                      ? selectTargetLinode('')
                      : selectTargetLinode(Object.values(linodes.linodes)[0].id))
                  }
                />
                <span>New Linode</span>
              </label>
            </div>
            <div className="radio">
              <label>
                <input
                  type="radio"
                  name="restore-target"
                  checked={targetLinode !== '' && targetLinode !== thisLinode.id}
                  onChange={e =>
                    dispatch(e.target.checked
                      ? selectTargetLinode(Object.values(linodes.linodes)[0].id)
                      : selectTargetLinode(''))
                  }
                />
                <span>Existing Linode</span>
              </label>
              <select
                className="form-control"
                value={targetLinode}
                onChange={e => dispatch(selectTargetLinode(e.target.value))}
              >
                <option value={''}>Pick a Linode...</option>
                {Object.values(linodes.linodes).filter(l => l.id !== thisLinode.id)
                  .map(l => <option value={l.id} key={l.id}>{l.label}</option>)}
              </select>
            </div>
          </div>
        </div>
        <button
          className="btn btn-primary"
          disabled={this.state.loading || selectedBackup === null}
          onClick={() => this.restore(targetLinode, selectedBackup)}
        >Restore backup</button>
      </div>
    );
  }

  renderSchedule() {
    const linode = this.getLinode();
    const { dayOfWeek, timeOfDay } = this.props.backups;
    const { dispatch } = this.props;
    return (
      <div className="backup-schedule">
        <div className="form-group row">
          <label htmlFor="schedule" className="col-md-4 form-control-label">
            {/* TODO: Use user time settings */}
            Time of Day (EST):
          </label>
          <div className="col-md-4">
            <select
              value={timeOfDay}
              className="form-control"
              id="schedule"
              onChange={e => dispatch(setTimeOfDay(e.target.value))}
            >
              <option value="0000-0200">12-2 AM</option>
              <option value="0200-0400">2-4 AM</option>
              <option value="0400-0600">4-6 AM</option>
              <option value="0600-0800">6-8 AM</option>
              <option value="0800-1000">8-10 AM</option>
              <option value="1000-1200">10 AM-12 PM</option>
              <option value="1200-1400">12-2 PM</option>
              <option value="1400-1600">2-4 PM</option>
              <option value="1600-1800">4-6 PM</option>
              <option value="1800-2000">6-8 PM</option>
              <option value="2000-2200">8-10 PM</option>
              <option value="2200-0000">10 PM-12 AM</option>
            </select>
          </div>
        </div>
        <div className="form-group row">
          <label htmlFor="dow" className="col-md-4 form-control-label">
            Day of week:
          </label>
          <div className="col-md-4">
            <select
              value={dayOfWeek}
              className="form-control"
              id="dow"
              onChange={e => dispatch(setDayOfWeek(e.target.value))}
            >
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">
            <p className="text-muted">
              The weekly and bi-weekly backups store the one
              and two week old backup created this day, respectively.
            </p>
            <button
              className="btn btn-primary"
            >Save</button>
            <button
              className="btn btn-danger-outline"
              onClick={
                () => dispatch(showModal(
                  'Cancel backups',
                  this.renderCancelBackupModal(linode)
                ))
              }
            >Cancel backups</button>
          </div>
        </div>
      </div>
    );
  }

  renderLastManualBackup() {
    const lastManualBackup = null; // TODO
    if (lastManualBackup) {
      return (
        <p>TODO</p>
      );
    }
    return <p>No manual backups have been taken yet.</p>;
  }

  renderEnabled() {
    return (
      <div>
        <h2>Details and restore</h2>
        {this.renderBackups()}
        <hr />
        <div className="row">
          <div className="col-md-6 backup-schedule">
            <h2>
              Schedule
              <HelpButton to="http://example.org" />
            </h2>
            {this.renderSchedule()}
          </div>
          <div className="col-md-6 manual-backups">
            <h2>Manual Backup</h2>
            {this.renderLastManualBackup()}
            <button
              className="btn btn-primary"
            >Take backup</button>
          </div>
        </div>
      </div>
    );
  }

  renderNotEnabled() {
    const linode = this.getLinode();
    return (
      <div>
        <p>Backups are not enabled for this Linode.</p>
        <button
          className="btn btn-primary"
          onClick={() => this.enableLinodeBackup(linode)}
        >Enable backups</button>
        <HelpButton to="http://example.org" />
      </div>
    );
  }

  render() {
    const linode = this.getLinode();
    if (!linode) return null;
    return linode.backups.enabled ? this.renderEnabled() : this.renderNotEnabled();
  }
}

BackupsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  backups: PropTypes.object.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string.isRequired,
  }).isRequired,
};

function select(state) {
  return {
    linodes: state.api.linodes,
    backups: state.linodes.detail.backups,
  };
}

export default connect(select)(BackupsPage);

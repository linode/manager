import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { ErrorSummary, reduceErrors } from '~/errors';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { linodes } from '~/api';
import { linodeBackups } from '~/api/linodes';
import { takeBackup, restoreBackup } from '~/api/backups';
import { setError } from '~/actions/errors';

function renderDateTime(dt) {
  return dt.replace('T', ' ');
}

function getBackups(backups) {
  const backupList = [];
  backupList.push(
    backups.daily,
    backups.weekly[0],
    backups.weekly[1],
    backups.snapshot.current || backups.snapshot.in_progress,
  );

  return backupList.filter(Boolean);
}

function getBackup(backups, backupId) {
  const backupList = getBackups(backups);

  for (const backup of backupList) {
    if (backup && backup.id === parseInt(backupId)) {
      return backup;
    }
  }
}

export class BackupPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = Object.values(getState().api.linodes.linodes).reduce(
      (match, linode) => linode.label === linodeLabel ? linode : match);

    try {
      await dispatch(linodeBackups(id));
      // All linodes are in-fact needed for restore dialog.
      await dispatch(linodes.all());
    } catch (e) {
      dispatch(setError(e));
    }
  }

  constructor(props) {
    super(props);
    this.getLinode = getLinode.bind(this);
    this.takeSnapshot = this.takeSnapshot.bind(this);
    this.restore = this.restore.bind(this);
    const { id: linodeId } = this.getLinode();
    this.state = {
      linodeId,
      targetLinode: linodeId,
      overwrite: false,
      restoreErrors: {},
      takeSnapshotErrors: {},
    };
  }

  async takeSnapshot() {
    const { dispatch } = this.props;
    const { id: linodeId } = this.getLinode();
    try {
      await dispatch(takeBackup(linodeId));
    } catch (response) {
      const takeSnapshotErrors = await reduceErrors(response);
      this.setState({ takeSnapshotErrors });
    }
  }

  async restore() {
    const { dispatch } = this.props;
    const { backupId, linodeLabel } = this.props.params;
    const { id: linodeId } = this.getLinode();
    const { targetLinode, overwrite } = this.state;
    try {
      await dispatch(
        restoreBackup(linodeId, targetLinode, backupId, overwrite));
      dispatch(push(`/linodes/${linodeLabel}`));
    } catch (response) {
      const restoreErrors = await reduceErrors(response);
      this.setState({ restoreErrors });
    }
  }

  render() {
    const { linodes } = this.props;
    const { backupId } = this.props.params;
    const {
      targetLinode,
      overwrite,
      restoreErrors,
      takeSnapshotErrors,
    } = this.state;

    const linode = this.getLinode();
    const backup = getBackup(linode._backups, backupId);
    const duration = Math.floor((Date.parse(backup.finished) -
      Date.parse(backup.created)) / 1000 / 60);
    const durationUnit = duration === 1 ? 'minute' : 'minutes';
    const configs = backup.configs.join('<br />');

    // TODO: key={d.id} when disk IDs are added to API
    const disks = backup.disks.map(d =>
      <div key={d.label}>
        {d.label} ({d.filesystem}) - {d.size}MB
      </div>
    );
    const space = disks.length === 0 ? null :
      backup.disks.map(d => d.size).reduce((a, b) => a + b);

    const otherLinodes =
      Object.values(linodes.linodes).filter(l => l !== linode);

    const restoreTo = otherLinodes.map(
      l => <option value={l.id} key={l.id}>{l.label}</option>);

    restoreTo.splice(0, 0,
      <option value={linode.id} key={linode.id}>This Linode</option>);

    const restoreToField = (
      <div className="form-group row">
        <div className="col-sm-3 col-form-label">
          Restore to
        </div>
        <div className="col-sm-9">
          <select
            value={targetLinode}
            onChange={e => this.setState({ targetLinode: e.target.value })}
          >
            {restoreTo}
          </select>
        </div>
      </div>
    );

    const takeSnapshot = [(
      <div className="form-group row" key="errors">
        <div className="col-sm-3 col-form-label"></div>
        <div className="col-sm-9">
          <ErrorSummary errors={takeSnapshotErrors} />
        </div>
      </div>
    ), (
      <div className="form-group row" key="button">
        <div className="col-sm-3 col-form-label"></div>
        <div className="col-sm-9">
          <button
            type="button"
            className="btn btn-default"
            name="takeSnapshot"
            onClick={this.takeSnapshot}
          >
            Take new snapshot
          </button>
        </div>
      </div>
    )];

    const bemField = name =>
      `col-sm-9  right LinodesLinodeBackupsBackupPage-${name}`;

    const label = (
      <div className="row">
        <div className="col-sm-3">
          Label
        </div>
        <div className={bemField('label')}>
          {backup.label}
        </div>
      </div>
    );

    const vacant = 'In progress';

    return (
      <div>
        <section className="card">
          <header>
            <h2>Backup details</h2>
          </header>
          {backup.label ? label : null}
          <div className="row">
            <div className="col-sm-3">
              Started
            </div>
            <div className={bemField('started')}>
              {renderDateTime(backup.created)}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3">
              Finished
            </div>
            <div className={bemField('finished')}>
              {backup.finished ? renderDateTime(backup.finished) : vacant}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3">
              Duration
            </div>
            <div className={bemField('duration')}>
              {backup.finished ? `(${duration} ${durationUnit})` : vacant}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3">
              Datacenter constraint
            </div>
            <div className={bemField('datacenter')}>
              {backup.datacenter.label}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3">
              Configuration profiles
            </div>
            <div className={bemField('configs')}>
              {configs || vacant}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3">
              Disks
            </div>
            <div className={bemField('disks')}>
              {disks.length === 0 ? vacant : disks}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3">
              Space required
            </div>
            <div className={bemField('space')}>
              {disks.length === 0 ? vacant : `${space}MB`}
            </div>
          </div>
          {backup.type === 'snapshot' && backup.status !== 'pending' ?
            takeSnapshot : ''}
        </section>
        {backup.status === 'pending' ? null :
          <section className="card">
            <header>
              <h2>Restore</h2>
            </header>
            {restoreToField}
            <div className="form-group row">
              <div className="col-sm-3 col-form-label"></div>
              <div className="col-sm-9 checkbox">
                <label>
                  <input
                    id="destroy-all"
                    type="checkbox"
                    value={overwrite}
                    name="overwrite"
                    onChange={() => this.setState({ overwrite: !overwrite })}
                  />
                  <span>Destroy all current disks and backups</span>
                </label>
              </div>
            </div>
            <div className="form-group row">
              <div className="col-sm-3 col-form-label"></div>
              <div className="col-sm-9">
                <ErrorSummary errors={restoreErrors} />
              </div>
            </div>
            <div className="row">
              <div className="col-sm-3 col-form-label"></div>
              <div className="col-sm-9">
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={this.restore}
                  name="restore"
                >
                  Restore
                </button>
              </div>
            </div>
          </section>
        }
      </div>
    );
  }
}

BackupPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string.isRequired,
    backupId: PropTypes.string.isRequired,
  }).isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(BackupPage);

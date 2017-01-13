import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { ErrorSummary, reduceErrors } from '~/errors';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { linodes } from '~/api';
import { takeBackup, restoreBackup } from '~/api/backups';
import { setError } from '~/actions/errors';
import Select from '~/components/Select';
import Checkbox from '~/components/Checkbox';

function renderDateTime(dt) {
  return dt.replace('T', ' ');
}

export class BackupPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = Object.values(getState().api.linodes.linodes).reduce(
      (match, linode) => linode.label === linodeLabel ? linode : match);

    try {
      await dispatch(linodes.backups.all([id]));
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
    const backup = linode._backups.backups[backupId];

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

    const space = backup.disks.map(d => d.size).reduce((a, b) => a + b);

    const otherLinodes =
      Object.values(linodes.linodes).filter(l => l !== linode);

    const restoreTo = otherLinodes.map(
      l => <option value={l.id} key={l.id}>{l.label}</option>);

    restoreTo.splice(0, 0,
      <option value={linode.id} key={linode.id}>This Linode</option>);

    const restoreToField = (
      <div className="form-group row">
        <div className="col-sm-3 label-col">
          <label>Restore to</label>
        </div>
        <div className="col-sm-9 content-col right">
          <Select
            value={targetLinode}
            onChange={e => this.setState({ targetLinode: e.target.value })}
          >
            {restoreTo}
          </Select>
        </div>
      </div>
    );

    const takeSnapshot = [(
      <div className="form-group row" key="errors">
        <div className="col-sm-3 label-col"></div>
        <div className="col-sm-9 content-col right">
          <ErrorSummary errors={takeSnapshotErrors} />
        </div>
      </div>
    ), (
      <div className="form-group row" key="button">
        <div className="col-sm-3 label-col"></div>
        <div className="col-sm-9 content-col right">
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
      `col-sm-9 content-col right LinodesLinodeBackupsBackupPage-${name}`;

    const label = (
      <div className="form-group row">
        <div className="col-sm-3 label-col">
          <label>Label</label>
        </div>
        <div className={bemField('label')}>
          {backup.label}
        </div>
      </div>
    );

    return (
      <div>
        <section className="card">
          <header>
            <h2>Backup details</h2>
          </header>
          {backup.label ? label : null}
          <div className="form-group row">
            <div className="col-sm-3 label-col">
              Started
            </div>
            <div className={bemField('started')}>
              {renderDateTime(backup.created)}
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-3 label-col">
              Finished
            </div>
            <div className={bemField('finished')}>
              {renderDateTime(backup.finished)}
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-3 label-col">
              Duration
            </div>
            <div className={bemField('duration')}>
              {`(${duration} ${durationUnit})`}
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-3 label-col">
              Datacenter constraint
            </div>
            <div className={bemField('datacenter')}>
              {backup.datacenter.label}
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-3 label-col">
              Configuration profiles
            </div>
            <div className={bemField('configs')}>
              {configs}
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-3 label-col">
              Disks
            </div>
            <div className={bemField('disks')}>
              {disks}
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-3 label-col">
              Space required
            </div>
            <div className={bemField('space')}>
              {`${space}MB`}
            </div>
          </div>
          {backup.type === 'snapshot' ? takeSnapshot : ''}
        </section>
        <section className="card">
          <header>
            <h2>Restore</h2>
          </header>
          {restoreToField}
          <div className="form-group row">
            <div className="col-sm-3 label-col"></div>
            <div className="col-sm-9 content-col">
              <Checkbox
                checked={overwrite}
                label="Destroy all current disks and backups"
                onChange={() => this.setState({ overwrite: !overwrite })}
              />
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-3 label-col"></div>
            <div className="col-sm-9 content-col right">
              <ErrorSummary errors={restoreErrors} />
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-3 label-col"></div>
            <div className="col-sm-9 content-col right">
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

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { ErrorSummary, reduceErrors } from '~/errors';
import { selectLinode } from '../../utilities';
import { linodes } from '~/api';
import { linodeBackups } from '~/api/linodes';
import { takeBackup, restoreBackup } from '~/api/backups';
import { setError } from '~/actions/errors';
import { Card, CardHeader } from 'linode-components/cards';

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

import { BackupRestore, BackupDetails } from '../components';
import { selectLinode } from '../../utilities';


export class BackupPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    try {
      // All linodes are in-fact needed for restore dialog.
      await dispatch(linodes.all());
      const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
      await dispatch(linodeBackups(id));
    } catch (e) {
      dispatch(setError(e));
    }
  }

  constructor(props) {
    super(props);

    this.takeSnapshot = this.takeSnapshot.bind(this);
    this.restore = this.restore.bind(this);
    const { id: linodeId } = props.linode;
    this.state = {
      linodeId,
      targetLinode: linodeId,
      overwrite: false,
      restoreErrors: {},
      takeSnapshotErrors: {},
    };
  }

  async takeSnapshot() {
    const { dispatch, linode } = this.props;
    try {
      await dispatch(takeBackup(linode.id));
    } catch (response) {
      const takeSnapshotErrors = await reduceErrors(response);
      this.setState({ takeSnapshotErrors });
    }
  }

  async restore() {
    const { dispatch, linode, backupId } = this.props;
    const { targetLinode, overwrite } = this.state;
    try {
      await dispatch(
        restoreBackup(linode.id, targetLinode, backupId, overwrite));
      dispatch(push(`/linodes/${linode.label}`));
    } catch (response) {
      const restoreErrors = await reduceErrors(response);
      this.setState({ restoreErrors });
    }
  }

  render() {
    const { linodes, linode, backupId } = this.props;
    const {
      targetLinode,
      overwrite,
      restoreErrors,
      takeSnapshotErrors,
    } = this.state;

    const backup = getBackup(linode._backups, backupId);
    const duration = Math.floor((Date.parse(backup.finished) -
      Date.parse(backup.created)) / 1000 / 60);
    const durationUnit = duration === 1 ? 'minute' : 'minutes';
    const configs = backup.configs.map(function (config) {
      return (<div>{config}</div>);
    });

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
    ), (
      <div className="form-group row" key="errors">
        <div className="col-sm-3 col-form-label"></div>
        <div className="col-sm-9">
          <ErrorSummary errors={takeSnapshotErrors} />
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
        <BackupDetails linode={linode} backup={backup} dispatch={dispatch} />
        <BackupRestore
          linode={linode}
          backup={backup}
          dispatch={dispatch}
          linodes={this.props.linodes}
        />
      </div>
    );
  }
}

BackupPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
  backupId: PropTypes.string.isRequired,
};

function select(state, props) {
  const { linode } = selectLinode(state, props);
  const { linodes } = state.api;
  const { backupId } = props.params;
  return { linode, backupId, linodes };
}

export default connect(select)(BackupPage);

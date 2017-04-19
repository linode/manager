import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setError } from '~/actions/errors';
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

  render() {
    const { dispatch, linode, backup } = this.props;
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
  backup: PropTypes.object.isRequired,
};

function select(state, props) {
  const { linode } = selectLinode(state, props);
  const { linodes } = state.api;
  const { backupId } = props.params;
  const backup = objectFromMapByLabel(linode._backups, backupId, 'id');
  return { linode, backup, linodes };
}

export default connect(select)(BackupPage);

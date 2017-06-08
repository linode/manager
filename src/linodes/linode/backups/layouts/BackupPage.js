import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { linodes } from '~/api';

import { BackupRestore, BackupDetails } from '../components';
import { selectLinode } from '../../utilities';


export class BackupPage extends Component {
  static async preload({ dispatch }) {
    // All linodes are in-fact needed for restore dialog.
    await dispatch(linodes.all());
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
  const backupId = parseInt(props.params.backupId);

  const backups = linode._backups;
  let backup;
  if (backups) {
    if (backups.daily && backups.daily.id === backupId) {
      backup = backups.daily;
    }

    if (backups.snapshot) {
      if (backups.snapshot.current && backups.snapshot.current.id === backupId) {
        backup = backups.snapshot.current;
      } else if (backups.snapshot.in_progress && backups.snapshot.in_progress.id === backupId) {
        backup = backups.snapshot.in_progress;
      }
    }

    if (backups.weekly.length) {
      if (backups.weekly[0] && backups.weekly[0].id === backupId) {
        backup = backups.weekly[0];
      } else if (backups.weekly[1] && backups.weekly[1].id === backupId) {
        backup = backups.weekly[1];
      }
    }
  }

  return { linode, backup, linodes };
}

export default connect(select)(BackupPage);

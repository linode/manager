import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import api from '~/api';

import { BackupRestore, BackupDetails } from '../components';
import { selectLinode } from '../../utilities';
import { ComponentPreload as Preload } from '~/decorators/Preload';


export const BackupPage = (props) => {
  const { dispatch, linode, backup } = props;
  return (
    <div>
      <section>
        <BackupDetails linode={linode} backup={backup} dispatch={dispatch} />
      </section>
      <BackupRestore
        linode={linode}
        backup={backup}
        dispatch={dispatch}
        linodes={this.props.linodes}
      />
    </div>
  );
};

BackupPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
  backup: PropTypes.object.isRequired,
};

function mapStateToProps(state, props) {
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

    if (backups.weekly && backups.weekly.length) {
      if (backups.weekly[0] && backups.weekly[0].id === backupId) {
        backup = backups.weekly[0];
      } else if (backups.weekly[1] && backups.weekly[1].id === backupId) {
        backup = backups.weekly[1];
      }
    }
  }

  return { linode, backup, linodes };
}

export default compose(
  connect(mapStateToProps),
  Preload(
    async function (dispatch) {
      // All linodes are in-fact needed for restore dialog.
      await dispatch(api.linodes.all());
    }
  )
)(BackupPage);

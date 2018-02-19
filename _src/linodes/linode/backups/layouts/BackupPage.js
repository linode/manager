import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import api from '~/api';

import { BackupRestore, BackupDetails } from '../components';
import { selectLinode } from '../../utilities';
import { ComponentPreload as Preload } from '~/decorators/Preload';

/**
 * @func
 * @param {Object}
 * @returns {Object[]}
 */
export const backupsToList = compose(

  /**
   * @func
   * @param {Object} backups
   * @returns {Object[]} - Array of backup Objects.
   */
  (backups) => backups.result,

  /**
   * Appends backups.snapshot.in_progress to backups.result if it exists.
   *
   * @func
   * @param {object} backups
   * @returns {object}
   */
  (backups) => {
    if (!backups.snapshot.in_progress) {
      return backups;
    }

    return {
      ...backups,
      result: [...backups.result, backups.snapshot.in_progress],
    };
  },

  /**
   * Appends backups.snapshot.current to backups.result if it exists.
   *
   * @func
   * @param {object} backups
   * @returns {object}
   */
  (backups) => {
    if (!backups.snapshot.current) {
      return backups;
    }

    return {
      ...backups,
      result: [...backups.result, backups.snapshot.current],
    };
  },

  /**
   * Creates a new property 'result' on backups with the value of backups.automatic.
   *
   * @func
   * @param {object} backups
   * @returns {object}
   */
  (backups) => {
    return {
      ...backups,
      result: backups.automatic || [],
    };
  },
);

const mergeBackupsThenFindById = (id, backups) => compose(
  (backups) => backups.find((b) => b.id === id),
  backupsToList,
)(backups);

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
        linodes={props.linodes}
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
  const backupId = parseInt(props.match.params.backupId);

  return {
    linode,
    backup: mergeBackupsThenFindById(backupId, linode._backups),
    linodes,
  };
}

const preloadRequest = async (dispatch) => {
  // All linodes are in-fact needed for restore dialog.
  await dispatch(api.linodes.all());
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest)
)(BackupPage);

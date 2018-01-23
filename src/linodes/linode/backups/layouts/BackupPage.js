import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
// import { compose } from 'redux';
import api from '~/api';

import { BackupRestore, BackupDetails } from '../components';
import { selectLinode } from '../../utilities';
import { ComponentPreload as Preload } from '~/decorators/Preload';

import unless from 'ramda/src/unless';
import path from 'ramda/src/path';
import propOr from 'ramda/src/propOr';
import assoc from 'ramda/src/assoc';
import prop from 'ramda/src/prop';
import compose from 'ramda/src/compose';
import over from 'ramda/src/over';
import lensProp from 'ramda/src/lensProp';
import isNil from 'ramda/src/isNil';
import curry from 'ramda/src/curry';
import propEq from 'ramda/src/propEq';

const currentSnapshot = path(['snapshot', 'current']);

const inProgressSnapshot = path(['snapshot', 'in_progress']);

export const findById = curry((id, list) => list.find(propEq('id', id)));

export const backupsToList = (backups) => compose(
  prop('result'),
  unless(
    compose(isNil, inProgressSnapshot),
    over(lensProp('result'), (result) => [...result, inProgressSnapshot(backups)])
  ),
  unless(
    compose(isNil, currentSnapshot),
    over(lensProp('result'), (result) => [...result, currentSnapshot(backups)])
  ),
  assoc('result', propOr([], 'automatic', backups)),
)(backups);

const mergeBackupsThenFindById = (id, backups) => compose(
  findById(id),
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

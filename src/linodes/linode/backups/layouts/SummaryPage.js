import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { getLinode } from './IndexPage';
import { fetchLinode, fetchLinodes, putLinode } from '~/actions/api/linodes';
import SnapshotPanel from '~/linodes/linode/backups/components/SnapshotPanel';
import { RestorePanel } from '~/linodes/linode/backups/components/RestorePanel';
import moment from 'moment';

export function getBackupsByType(linodes, linodeId, type) {
  const backups = linodes.linodes[linodeId]._backups;
  let backupsList = [];
  for (var backupIds in backups.backups) {
    const backup = backups.backups[backupIds];
    if(backup.type === type) {
      backupsList = backupsList.concat(backup);
    }
  }

  return backupsList.reverse();
}

export function SummaryPage(props) {
  const { linodes } = props;
  const linodeId = parseInt(props.params.linodeId);
  const snapshots = getBackupsByType(linodes, linodeId, 'snapshot');

  let snapshot = snapshots[0];
  for(let currentSnapshot of snapshots) {
    if(!currentSnapshot._polling) {
      snapshot = currentSnapshot;
      break;
    }
  }

  return (
    <div>
      {SnapshotPanel(snapshot)}
      {RestorePanel()}
    </div>
  );
}

SummaryPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string.isRequired,
  }).isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(SummaryPage);

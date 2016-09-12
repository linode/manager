import React, { Component, PropTypes } from 'react';
import moment, { ISO_8601 } from 'moment';
import { fetchBackupUntil } from '~/actions/api/backups';
import { BackupStatus } from '~/constants';
import { connect } from 'react-redux';

const calendar = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Yesterday]',
  lastWeek: 'dddd',
  sameElse: ISO_8601,
};

function backupStatusDisplay(backup, content) {
  if (backup.status !== 'successful') {
    if (backup.status === 'needsPostProcessing') {
      content = 'Backup running';
    } else if (backup.status === 'userAborted') {
      content = 'User aborted backup';
    } else {
      content = `Backup ${backup.status}`;
    }
  }

  return content;
}

export class Backup extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    const { linode, backup, dispatch } = this.props;
    const indeterminate = b => BackupStatus.pending.indexOf(b.status) !== -1;
    if (indeterminate(backup)) {
      dispatch(fetchBackupUntil(bu => !indeterminate(bu), 10000, linode.id, backup.id));
    }
  }

  render() {
    const { backup, selected, onSelect } = this.props;
    const created = moment(backup.created);
    const cardTitle = created.calendar(null, calendar);

    return (
      <div
        className={`backup ${selected === backup.id ? 'selected' : ''}`}
        onClick={onSelect}
      >
        <header>
          <div className="title">
            {backup.type === 'snapshot' ? 'Snapshot' : cardTitle}
          </div>
        </header>
        <div>
          <div className="content-col">{
            backupStatusDisplay(backup, created.format('dddd, MMMM D YYYY LT'))
          }</div>
        </div>
      </div>
    );
  }
}

Backup.propTypes = {
  dispatch: PropTypes.func.isRequired,
  backup: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(Backup);

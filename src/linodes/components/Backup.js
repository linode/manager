import React, { PropTypes } from 'react';
import moment, { ISO_8601 } from 'moment';

const calendar = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Yesterday]',
  lastWeek: 'dddd',
  sameElse: ISO_8601,
};

export default function Backup(props) {
  const { backup, selected, onSelect } = props;
  const created = moment(backup.created);
  const cardTitle = created.calendar(null, calendar);
  let content = created.format('dddd, MMMM D YYYY LT');

  if (backup.status !== 'successful') {
    if (backup.status === 'needsPostProcessing') {
      content = 'Backup running';
    } else if (backup.status === 'userAborted') {
      content = 'User aborted backup';
    } else {
      content = `Backup ${backup.status}`;
    }
  }

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
      <div className="form-group">
        <div className="content-col">{content}</div>
      </div>
    </div>
  );
}

Backup.propTypes = {
  backup: PropTypes.object.isRequired,
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

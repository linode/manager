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
  const { backup, selected, future, onSelect } = props;
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

  let title = '';
  if (!future) {
    if (backup.type === 'snapshot') {
      title = 'Snapshot';
    } else {
      title = cardTitle;
    }
  } else {
    title = backup.created;
  }

  const selectedClass = selected === backup.id ? 'selected' : '';
  const futureClass = future === true ? 'future' : '';

  return (
    <div
      className={`backup ${selectedClass} ${futureClass}`}
      onClick={onSelect}
    >
      <header><div className="title">{title}</div></header>
      <div className={!!future ? 'future-disabled' : ''}>
        <div className="content-col">{!!future ? backup.content : content}</div>
      </div>
    </div>
  );
}

Backup.propTypes = {
  backup: PropTypes.object.isRequired,
  future: PropTypes.bool,
  selected: PropTypes.number,
  onSelect: PropTypes.func.isRequired,
};

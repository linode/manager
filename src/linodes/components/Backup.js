import React, { PropTypes } from 'react';
import TimeDisplay from '~/components/TimeDisplay';

export default function Backup(props) {
  const { backup, title, selected, onSelect } = props;
  const { future } = backup;

  let backupClass = (selected && selected === backup.id) ? 'selected' : '';
  if (future) backupClass = 'future';

  let content = backup.type === 'snapshot' && 'No snapshot taken.' || 'Pending';
  if (!future) {
    content = <TimeDisplay time={backup.created} />;
    if (backup.status !== 'successful') {
      if (backup.status === 'needsPostProcessing') {
        content = 'Backup running';
      } else if (backup.status === 'userAborted') {
        content = 'User aborted backup';
      } else {
        content = `Backup ${backup.status}`;
      }
    }
  }

  return (
    <div
      className={`backup ${backupClass}`}
      onClick={onSelect}
    >
      <header><div className="title">{title}</div></header>
      <div className={future ? 'future-disabled' : ''}>
        <div>{content}</div>
      </div>
    </div>
  );
}

Backup.propTypes = {
  backup: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  selected: PropTypes.number,
  onSelect: PropTypes.func.isRequired,
};

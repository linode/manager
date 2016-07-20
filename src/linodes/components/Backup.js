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
  return (
    <div
      className={`backup ${selected === backup.id ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <header>
        <div className="title">{cardTitle}</div>
      </header>
      <div>
        <div className="content-col">{created.format('dddd, MMMM D YYYY LT')}</div>
      </div>
    </div>
  );
}

Backup.propTypes = {
  backup: PropTypes.object.isRequired,
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

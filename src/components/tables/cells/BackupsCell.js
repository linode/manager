import React, { PropTypes } from 'react';

import { LinkCell } from 'linode-components/tables/cells';


export default function BackupsCell(props) {
  const { column, record } = props;

  return (
    <LinkCell column={column} record={record}>
      {record.backups.enabled ? 'View Backups' : 'Enable Backups'}
    </LinkCell>
  );
}

BackupsCell.propTypes = {
  column: PropTypes.object.isRequired,
  record: PropTypes.shape({
    backups: PropTypes.object.isRequired,
  }),
};


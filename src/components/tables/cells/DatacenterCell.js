import React, { PropTypes } from 'react';

import TableCell from './TableCell';
import Datacenter from '~/linodes/components/Datacenter';


// TODO: this should probably be a more generic icon + text cell
export default function DatacenterCell(props) {
  const { column, record } = props;

  return (
    <TableCell column={column} record={record}>
      <Datacenter obj={record} />
    </TableCell>
  );
}

DatacenterCell.propTypes = {
  column: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
};

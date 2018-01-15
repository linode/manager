import PropTypes from 'prop-types';
import React from 'react';

import TableCell from 'linode-components/dist/tables/cells/TableCell';
import Region from '~/linodes/components/Region';


// TODO: this should probably be a more generic icon + text cell
export default function RegionCell(props) {
  const { column, record } = props;

  return (
    <TableCell column={column} record={record}>
      <Region obj={record} />
    </TableCell>
  );
}

RegionCell.propTypes = {
  column: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
};

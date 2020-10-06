import * as React from 'react';
import TableCell_PreCMR from 'src/components/TableCell';
import TableCell_CMR from 'src/components/TableCell/TableCell_CMR';
import TableRow_PreCMR from 'src/components/TableRow';
import TableRow_CMR from 'src/components/TableRow/TableRow_CMR';
import { LongviewService } from 'src/features/Longview/request.types';

interface Props {
  service: LongviewService;
  cmrFlag?: boolean;
}

export const LongviewServiceRow: React.FC<Props> = props => {
  const { service, cmrFlag } = props;

  const TableCell = cmrFlag ? TableCell_CMR : TableCell_PreCMR;
  const TableRow = cmrFlag ? TableRow_CMR : TableRow_PreCMR;

  return (
    <TableRow ariaLabel={service.name} data-testid="longview-service-row">
      <TableCell parentColumn="Process" data-qa-service-process>
        {service.name}
      </TableCell>
      <TableCell parentColumn="User" data-qa-service-user>
        {service.user}
      </TableCell>
      <TableCell parentColumn="Protocol" data-qa-service-protocol>
        {service.type}
      </TableCell>
      <TableCell parentColumn="Port" data-qa-service-port>
        {service.port}
      </TableCell>
      <TableCell parentColumn="IP" data-qa-service-ip>
        {service.ip}
      </TableCell>
    </TableRow>
  );
};

export default LongviewServiceRow;

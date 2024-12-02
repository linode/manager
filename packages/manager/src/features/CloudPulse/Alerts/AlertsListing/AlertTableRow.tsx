import { Typography } from '@linode/ui';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { capitalize } from 'src/utilities/capitalize';

import { alertSeverityOptions } from '../constants';
import { AlertActionMenu } from './AlertActionMenu';

import type { Alert } from '@linode/api-v4';

interface Props {
  alert: Alert;
}

export const AlertTableRow = React.memo((props: Props) => {
  const { alert } = props;
  const { created_by, id, label, service_type, status, updated } = alert;
  const alertSeverity = alertSeverityOptions.find(
    (option) => option.value === alert.severity
  );
  return (
    <TableRow data-qa-alert-cell={id} key={`alert-row-${id}`}>
      <TableCell>{label}</TableCell>
      <TableCell>{service_type}</TableCell>
      <TableCell>{alertSeverity?.label}</TableCell>
      <TableCell>
        <Typography color={status === 'enabled' ? 'limegreen' : 'gray'}>
          {capitalize(status)}
        </Typography>
      </TableCell>
      <TableCell>
        <DateTimeDisplay value={updated} />
      </TableCell>
      <TableCell>{created_by}</TableCell>
      <TableCell actionCell>
        {/* handlers are supposed to be passed to this AlertActionMenu,
        it is dependent on other feature and will added as that feature in the next PR
        */}
        <AlertActionMenu />
      </TableCell>
    </TableRow>
  );
});

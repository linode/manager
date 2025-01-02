import { Box } from '@linode/ui';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { capitalize } from 'src/utilities/capitalize';

import { AlertActionMenu } from './AlertActionMenu';

import type { Item } from '../constants';
import type { Alert, AlertServiceType, AlertStatusType } from '@linode/api-v4';

interface Props {
  /**
   * alert details used by the component to fill the row details
   */
  alert: Alert;
  /**
   * services list for the reverse mapping to display the labels from the alert service values
   */
  services: Item<string, AlertServiceType>[];
}

const getStatus = (status: AlertStatusType) => {
  if (status === 'enabled') {
    return 'active';
  } else if (status === 'disabled') {
    return 'inactive';
  }
  return 'other';
};

export const AlertTableRow = (props: Props) => {
  const { alert, services } = props;
  const { created_by, id, label, service_type, status, updated } = alert;
  return (
    <TableRow data-qa-alert-cell={id} key={`alert-row-${id}`}>
      <TableCell>{label}</TableCell>
      <TableCell>
        <Box alignItems="center" display="flex">
          <StatusIcon status={getStatus(status)} />
          {capitalize(status)}
        </Box>
      </TableCell>
      <TableCell>
        {services.find((service) => service.value === service_type)?.label}
      </TableCell>
      <TableCell>{created_by}</TableCell>
      <TableCell>
        <DateTimeDisplay value={updated} />
      </TableCell>
      <TableCell actionCell>
        {/* handlers are supposed to be passed to this AlertActionMenu,
    it is dependent on other feature and will added as that feature in the next PR
    */}
        <AlertActionMenu />
      </TableCell>
    </TableRow>
  );
};

import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import { humanizeLinodeInterfaceStatus } from '../utilities';

import type { APIError, LinodeInterfaceHistory } from '@linode/api-v4';

interface Props {
  data: LinodeInterfaceHistory[] | undefined;
  error: APIError[] | null;
  isPending: boolean;
}

export const HistoryTableContent = (props: Props) => {
  const { data, error, isPending } = props;

  const cols = 6;

  if (isPending) {
    return <TableRowLoading columns={cols} rows={1} />;
  }

  if (error) {
    return <TableRowError colSpan={cols} message={error?.[0].reason} />;
  }

  if (data?.length === 0) {
    return (
      <TableRowEmpty
        colSpan={cols}
        message="There is no network interface history for this Linode."
      />
    );
  }

  return data?.map((history) => (
    <TableRow key={history.interface_history_id}>
      <TableCell>
        <DateTimeDisplay value={history.created} />
      </TableCell>
      <TableCell>{history.interface_id}</TableCell>
      <TableCell>{history.linode_id}</TableCell>
      <TableCell>{history.event_id}</TableCell>
      <TableCell>{history.version}</TableCell>
      <TableCell>{humanizeLinodeInterfaceStatus(history.status)}</TableCell>
    </TableRow>
  ));
};

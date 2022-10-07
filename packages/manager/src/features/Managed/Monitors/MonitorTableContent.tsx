import {
  ManagedIssue,
  ManagedServiceMonitor,
} from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import MonitorRow from './MonitorRow';

interface Props {
  monitors: ManagedServiceMonitor[];
  issues: ManagedIssue[];
  loading: boolean;
  openDialog: (id: number, label: string) => void;
  openHistoryDrawer: (id: number, label: string) => void;
  openMonitorDrawer: (id: number, mode: string) => void;
  error?: APIError[] | null;
}

export type CombinedProps = Props;

export const MonitorTableContent: React.FC<CombinedProps> = (props) => {
  const {
    error,
    issues,
    loading,
    monitors,
    openDialog,
    openHistoryDrawer,
    openMonitorDrawer,
  } = props;

  if (loading) {
    return <TableRowLoading columns={3} />;
  }

  if (error) {
    return <TableRowError colSpan={4} message={error[0].reason} />;
  }

  if (monitors.length === 0) {
    return (
      <TableRowEmpty
        colSpan={4}
        message={"You don't have any Monitors on your account."}
      />
    );
  }

  return (
    // eslint-disable-next-line
    <>
      {monitors.map((monitor: ManagedServiceMonitor, idx: number) => (
        <MonitorRow
          key={`service-monitor-row-${idx}`}
          monitor={monitor}
          issues={issues.filter((i) => i.services.includes(monitor.id))}
          openDialog={openDialog}
          openMonitorDrawer={openMonitorDrawer}
          openHistoryDrawer={openHistoryDrawer}
        />
      ))}
    </>
  );
};

export default MonitorTableContent;

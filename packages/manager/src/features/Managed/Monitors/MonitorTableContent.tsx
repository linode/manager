import { ManagedServiceMonitor } from 'linode-js-sdk/lib/managed';
import * as React from 'react';

import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { ExtendedIssue } from 'src/store/managed/issues.actions';

import MonitorRow from './MonitorRow';

interface Props {
  monitors: ManagedServiceMonitor[];
  issues: ExtendedIssue[];
  loading: boolean;
  openDialog: (id: number, label: string) => void;
  openHistoryDrawer: (id: number, label: string) => void;
  openMonitorDrawer: (id: number, mode: string) => void;
  error?: Linode.ApiFieldError[];
}

export type CombinedProps = Props;

export const MonitorTableContent: React.FC<CombinedProps> = props => {
  const {
    error,
    issues,
    loading,
    monitors,
    openDialog,
    openHistoryDrawer,
    openMonitorDrawer
  } = props;
  if (loading) {
    return <TableRowLoading colSpan={12} />;
  }

  if (error) {
    return <TableRowError colSpan={12} message={error[0].reason} />;
  }

  if (monitors.length === 0) {
    return (
      <TableRowEmpty
        colSpan={12}
        message={"You don't have any Monitors on your account."}
      />
    );
  }

  return (
    <>
      {monitors.map((monitor: ManagedServiceMonitor, idx: number) => (
        <MonitorRow
          key={`service-monitor-row-${idx}`}
          monitor={monitor}
          issues={issues.filter(i => i.services.includes(monitor.id))}
          openDialog={openDialog}
          openMonitorDrawer={openMonitorDrawer}
          openHistoryDrawer={openHistoryDrawer}
        />
      ))}
    </>
  );
};

export default MonitorTableContent;

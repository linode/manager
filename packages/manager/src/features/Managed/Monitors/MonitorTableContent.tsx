import * as React from 'react';

import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import MonitorRow from './MonitorRow';

interface Props {
  monitors: Linode.ManagedServiceMonitor[];
  loading: boolean;
  error?: Linode.ApiFieldError[];
}

export type CombinedProps = Props;

export const MonitorTableContent: React.FC<CombinedProps> = props => {
  const { error, loading, monitors } = props;
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
        message={"You don't have any Service Monitors on your account."}
      />
    );
  }

  return (
    <>
      {monitors.map((monitor: Linode.ManagedServiceMonitor, idx: number) => (
        <MonitorRow key={`service-monitor-row-${idx}`} monitor={monitor} />
      ))}
    </>
  );
};

export default MonitorTableContent;

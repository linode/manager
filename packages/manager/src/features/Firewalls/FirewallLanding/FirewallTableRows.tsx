import { Firewall } from 'linode-js-sdk/lib/firewalls/types';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { compose } from 'recompose';

import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';

import { ActionHandlers } from './FirewallActionMenu';

import FirewallRow from './FirewallRow';

interface Props {
  data: Firewall[];
  loading: boolean;
  lastUpdated: number;
  error?: APIError[];
}

type CombinedProps = Props & ActionHandlers;

const FirewallTableRows: React.FC<CombinedProps> = props => {
  const {
    data: firewalls,
    loading: firewallsLoading,
    error: firewallsError,
    lastUpdated: firewallsLastUpdated,
    ...actionMenuHandlers
  } = props;

  if (firewallsLoading && firewallsLastUpdated === 0) {
    return <TableRowLoading colSpan={6} firstColWidth={25} oneLine />;
  }

  /**
   * only display error if we don't already have data
   */
  if (firewallsError && firewallsLastUpdated === 0) {
    return <TableRowError colSpan={6} message={firewallsError[0].reason} />;
  }

  if (firewallsLastUpdated !== 0 && Object.keys(firewalls).length === 0) {
    return (
      <TableRowEmpty colSpan={6} message="You do not have any Firewalls" />
    );
  }

  return (
    <React.Fragment>
      {firewalls.map(eachFirewall => {
        return (
          <FirewallRow
            key={`firewall-row-${eachFirewall.id}`}
            firewallID={eachFirewall.id}
            firewallLabel={eachFirewall.label}
            firewallRules={eachFirewall.rules}
            firewallStatus={eachFirewall.status}
            {...actionMenuHandlers}
          />
        );
      })}
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props & ActionHandlers>(React.memo)(
  FirewallTableRows
);

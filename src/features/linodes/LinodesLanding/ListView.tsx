import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Grid from 'src/components/Grid';
import { PaginationProps } from 'src/components/Paginate';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import LinodeRow from './LinodeRow/LinodeRow';

interface WithLinodes {
  data: Linode.Linode[];
}

interface ViewProps {
  images: Linode.Image[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction, linodeId: number, linodeLabel: string) => void;
}

type CombinedProps =
  & ViewProps
  & WithLinodes
  & PaginationProps;


export const ListView: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    handleOrderChange,
    data,
    openConfigDrawer,
    order,
    orderBy,
    toggleConfirmation,
  } = props;

  const isActive = (label: string) => label === orderBy;

  return (
    <Paper>
      <Grid container className="my0">
        <Grid item xs={12} className="py0">
          <Table arial-label="List of Linodes">
            <TableHead data-qa-table-head>
              <TableRow>
                <TableSortCell
                  label='label'
                  direction={order}
                  active={isActive('label')}
                  handleClick={handleOrderChange}
                >
                  Linode
                </TableSortCell>
                <TableCell>Plan</TableCell>
                <TableCell noWrap>Last Backup</TableCell>
                <TableCell>IP Addresses</TableCell>
                <TableCell>Region</TableCell>
                {/** @todo Enable sorting by region once ARB-1014 is resolved. */}
                {/* <TableSortCell
                  label='region'
                  direction={order}
                  active={isActive('region')}
                  handleClick={handleOrderChange}
                >
                  Region
                </TableSortCell> */}
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(linode =>
                <LinodeRow
                  key={linode.id}
                  linodeId={linode.id}
                  linodeType={linode.type}
                  linodeStatus={linode.status}
                  linodeIpv4={linode.ipv4}
                  linodeIpv6={linode.ipv6}
                  linodeRegion={linode.region}
                  linodeNotification={linode.notification}
                  linodeLabel={linode.label}
                  linodeBackups={linode.backups}
                  linodeTags={linode.tags}
                  linodeRecentEvent={linode.recentEvent}
                  openConfigDrawer={openConfigDrawer}
                  toggleConfirmation={toggleConfirmation}
                  mostRecentBackup={linode.mostRecentBackup}
                />,
              )}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ListView;

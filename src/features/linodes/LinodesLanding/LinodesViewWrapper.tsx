import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Grid from 'src/components/Grid';
import { PaginationProps } from 'src/components/Pagey';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { safeGetImageLabel } from 'src/utilities/safeGetImageLabel';
import LinodeCard from './LinodeCard';
import LinodeRow from './LinodeRow/LinodeRow';

type PaginatedLinodes = PaginationProps<Linode.Linode>;
interface ViewProps {
  linodes: Linode.EnhancedLinode[];
  images: Linode.Image[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction, linodeId: number, linodeLabel: string) => void;
  handleOrderChange: PaginatedLinodes['handleOrderChange'];
  order: PaginatedLinodes['order'];
  orderBy?: PaginatedLinodes['orderBy'];
}

const CardView: React.StatelessComponent<ViewProps> = (props) => {
  const { linodes, images, openConfigDrawer, toggleConfirmation } = props;

  return (
    <Grid container>
      {linodes.map(linode =>
        <LinodeCard
          key={linode.id}
          linodeId={linode.id}
          linodeStatus={linode.status}
          linodeIpv4={linode.ipv4}
          linodeIpv6={linode.ipv6}
          linodeRegion={linode.region}
          linodeType={linode.type}
          linodeNotification={linode.notification}
          linodeLabel={linode.label}
          linodeBackups={linode.backups}
          linodeTags={linode.tags}
          linodeRecentEvent={linode.recentEvent}
          imageLabel={safeGetImageLabel(images, linode.image)}
          openConfigDrawer={openConfigDrawer}
          linodeSpecDisk={linode.specs.disk}
          linodeSpecMemory={linode.specs.memory}
          linodeSpecVcpus={linode.specs.vcpus}
          linodeSpecTransfer={linode.specs.transfer}
          toggleConfirmation={toggleConfirmation}
        />,
      )}
    </Grid>
  )
};

const RowView: React.StatelessComponent<ViewProps> = (props) => {
  const {
    handleOrderChange,
    linodes,
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
              {linodes.map(linode =>
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
interface Props extends ViewProps {
  view: 'grid' | 'list';
}

const LinodesViewWrapper: React.StatelessComponent<Props> = (props) => {
  const { view, ...rest } = props;
  const Component = view === 'grid' ? CardView : RowView;

  return <Component {...rest} />
};

export default LinodesViewWrapper;

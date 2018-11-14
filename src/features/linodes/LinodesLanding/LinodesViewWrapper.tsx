import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';

import Grid from 'src/components/Grid';
import Table from 'src/components/Table';
import TableRow from 'src/components/TableRow';

import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { safeGetImageLabel } from 'src/utilities/safeGetImageLabel';
import LinodeCard from './LinodeCard';
import LinodeRow from './LinodeRow';

interface Props {
  view: 'grid' | 'list';
  linodes: Linode.EnhancedLinode[];
  images: Linode.Image[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction,
    linodeId: number, linodeLabel: string) => void;
}

class LinodesViewWrapper extends React.Component<Props, {}> {
  renderCards = () => {
    const { linodes, images, openConfigDrawer, toggleConfirmation } = this.props;

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
  }

  renderRows = () => {
    const { linodes, openConfigDrawer, toggleConfirmation } = this.props;

    return (
      <Paper>
        <Grid container className="my0">
          <Grid item xs={12} className="py0">
            <Table arial-label="List of Linodes">
              <TableHead data-qa-table-head>
                <TableRow>
                  <TableCell>Linode</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Last Backup</TableCell>
                  <TableCell>IP Addresses</TableCell>
                  <TableCell>Region</TableCell>
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
    )
  }

  render() {
    const { view } = this.props;
    return (
      <React.Fragment>
        {(view === 'grid')
          ? this.renderCards()
          : this.renderRows()}
      </React.Fragment>
    );
  }
};

export default LinodesViewWrapper;

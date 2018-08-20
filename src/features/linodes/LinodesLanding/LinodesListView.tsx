import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Grid from 'src/components/Grid';
import Table from 'src/components/Table';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';

import LinodeRow from './LinodeRow';

interface Props {
  linodes: Linode.EnhancedLinode[];
  images: Linode.Image[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction,
     linodeId: number, linodeLabel: string) => void;
}

const LinodesListView: React.StatelessComponent<Props> = (props) => {
  const { linodes, openConfigDrawer, toggleConfirmation } = props;

  return (
    <Paper>
      <Grid container className="my0">
        <Grid item xs={12} className="py0">
          <Table arial-label="List of Linodes">
            <TableHead data-qa-table-head>
              <TableRow>
                <TableCell>Linode</TableCell>
                <TableCell>IP Addresses</TableCell>
                <TableCell>Region</TableCell>
                <TableCell></TableCell>
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
                  linodeRecentEvent={linode.recentEvent}
                  openConfigDrawer={openConfigDrawer}
                  toggleConfirmation={toggleConfirmation}
                />,
              )}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Paper>
  );
};
export default LinodesListView;

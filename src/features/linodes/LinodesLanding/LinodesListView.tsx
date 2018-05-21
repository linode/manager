import * as React from 'react';

import Grid from 'src/components/Grid';
import Paper from 'material-ui/Paper';
import TableBody from 'material-ui/Table/TableBody';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';

import Table from 'src/components/Table';
import LinodeRow from './LinodeRow';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';

interface Props {
  linodes: Linode.EnhancedLinode[];
  images: Linode.Image[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
}

const LinodesListView: React.StatelessComponent<Props> = (props) => {
  const { linodes, openConfigDrawer } = props;

  return (
    <Paper>
      <Grid container className="my0">
        <Grid item xs={12} className="py0">
          <Table>
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
                  linodeRecentEvent={linode.recentEvent}
                  openConfigDrawer={openConfigDrawer}
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

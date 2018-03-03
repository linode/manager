import * as React from 'react';

import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Table from 'material-ui/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';

import LinodeRow from './LinodeRow';

interface Props {
  linodes: Linode.Linode[];
  images: Linode.Image[];
  types: Linode.LinodeType[];
}

const LinodesListView: React.StatelessComponent<Props> = (props) => {
  const { linodes, images, types } = props;

  return (
    <Paper elevation={1}>
      <Grid container>
        <Grid item xs={12}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>IP Addresses</TableCell>
                <TableCell>Region</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {linodes.map(linode =>
                <LinodeRow
                  key={linode.id}
                  linode={linode}
                  image={images.find(image => linode.image === image.id)}
                  type={types.find(type => linode.type === type.id)}
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

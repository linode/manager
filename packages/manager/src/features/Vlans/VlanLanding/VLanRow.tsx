import * as React from 'react';
import { compose } from 'recompose';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

export const VlanRow: React.FC = () => {
  return (
    <TableRow
    // key={`vlan-row-${vlanID}`}
    // rowLink={`/vlans/${vlanID}`}
    // data-testid={`vlan-row-${vlanID}`}
    // ariaLabel={`Virtual LAN ${vlanLabel}`}
    >
      <TableCell>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <EntityIcon variant="linode" />
          </Grid>
          <Grid item>
            <Typography variant="h3">Label</Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell>Region</TableCell>
      <TableCell>Linodes</TableCell>
      <TableCell>Tags</TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
};

export default compose(React.memo)(VlanRow);

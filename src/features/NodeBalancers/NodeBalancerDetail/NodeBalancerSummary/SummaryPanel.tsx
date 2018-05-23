import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import Grid from 'src/components/Grid';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import { formatRegion } from 'src/features/linodes/presentation';

import { convertMegabytesTo } from 'src/utilities/convertMegabytesTo';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  nodeBalancer: Linode.ExtendedNodeBalancer;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SummaryPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { nodeBalancer } = props;
  return (
    <Paper>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="headline">Summary</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption">
            <strong>Host Name:</strong> {nodeBalancer.hostname}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption">
            <strong>Ports:</strong> {nodeBalancer.ports.map((port, index, ports) => {
              // we want a comma after the port number as long as the ports array
              // has multiple values and the current index isn't the last
              // element in the array
              return (ports.length > 1 && index + 1 !== ports.length) ? `${port}, ` : port;
            })}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="caption">
            <strong>Node Status:</strong> {`${nodeBalancer.up} up, ${nodeBalancer.down} down`}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="caption">
            <strong>Transferred:</strong> {convertMegabytesTo(nodeBalancer.transfer.total)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <IPAddress ips={[nodeBalancer.ipv4]} copyRight />
          {nodeBalancer.ipv6 && <IPAddress ips={[nodeBalancer.ipv6]} copyRight />}
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption">
            {formatRegion(nodeBalancer.region)}
          </Typography>
        </Grid>
      </Grid>
    </Paper >
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SummaryPanel);


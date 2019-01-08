import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import { formatRegion } from 'src/utilities';
import { convertMegabytesTo } from 'src/utilities/convertMegabytesTo';

type ClassNames = 'root'
  | 'title'
  | 'IPWrapper'
  | 'IPgrouping'
  | 'marginTop'
  | 'nodeTransfer';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 2,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  IPWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  IPgrouping: {
    margin: '-2px 0 0 2px',
    display: 'flex',
    flexDirection: 'column'
  },
  marginTop: {
    marginTop: theme.spacing.unit * 2,
  },
  nodeTransfer: {
    marginTop: 12,
  },
});

interface Props {
  nodeBalancer: Linode.ExtendedNodeBalancer;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SummaryPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { nodeBalancer, classes } = props;
  return (
    <Paper className={classes.root}>
      <Grid container>
        <Grid item xs={12}>
          <Typography
            role="header"
            variant="h1"
            className={classes.title}
            data-qa-title
          >
            Summary
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div className={classes.IPWrapper}>
            <Typography variant="body1">
              <strong>IP:</strong>
            </Typography>
            <div className={classes.IPgrouping} data-qa-ip>
              <IPAddress ips={[nodeBalancer.ipv4]} copyRight showMore />
              {nodeBalancer.ipv6 && <IPAddress ips={[nodeBalancer.ipv6]} copyRight />}
            </div>
          </div>
          <Typography variant="body1" data-qa-ports className={classes.marginTop}>
            <strong>
              Ports: </strong> {nodeBalancer.ports.length === 0 && 'None'}
              {nodeBalancer.ports.join(', ')}
          </Typography>
          <Grid container className={classes.nodeTransfer}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" data-qa-node-status>
                <strong>Node Status:</strong> {`${nodeBalancer.up} up, ${nodeBalancer.down} down`}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" data-qa-transferred>
                <strong>Transferred:</strong> {convertMegabytesTo(nodeBalancer.transfer.total)}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" data-qa-hostname>
            <strong>Host Name:</strong> {nodeBalancer.hostname}
          </Typography>
          <Typography variant="body1" data-qa-region className={classes.marginTop}>
            <strong>Region:</strong> {formatRegion(nodeBalancer.region)}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(SummaryPanel);

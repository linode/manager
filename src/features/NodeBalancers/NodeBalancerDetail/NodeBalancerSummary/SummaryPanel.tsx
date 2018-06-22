import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import { formatRegion } from 'src/features/linodes/presentation';

import { convertMegabytesTo } from 'src/utilities/convertMegabytesTo';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    marginTop: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 3,
    paddingBottom: 20,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {
  nodeBalancer: Linode.ExtendedNodeBalancer;
}

type CombinedProps = Props & WithStyles<ClassNames>;

interface SectionProps {
  title: string;
  renderValue: (props: any) => JSX.Element | string | null;
}

const Section: React.StatelessComponent<SectionProps> = ({
  title,
  renderValue,
  ...rest
}) => (
    <Grid container style={{ marginTop: '8px' }}>
      <Grid item>
        <Typography variant="caption" data-qa-ports>
          <strong>{title}:</strong>
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="caption" data-qa-ports>
          {renderValue(rest)}
        </Typography>
      </Grid>
    </Grid>
  )

const SummaryPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { nodeBalancer, classes } = props;

  return (
    <Paper className={classes.root}>
      <Grid container>
        <Grid item xs={12}>
          <Typography
            variant="headline"
            className={classes.title}
            data-qa-title
          >
            Summary
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} style={{ margin: 0, padding: 0 }}>
          <Section
            title="IPv4"
            renderValue={renderIPv4(nodeBalancer)}
          />

          {nodeBalancer.ipv6 &&
            <Section
              title="IPv6"
              renderValue={renderIPv6(nodeBalancer)}
            />
          }

          <Section
            title="Transferred"
            renderValue={renderTransferred(nodeBalancer)}
          />

          <Section
            title="Node Status"
            renderValue={renderNodesStatus(nodeBalancer)}
          />

        </Grid>
        <Grid item xs={12} sm={6} style={{ margin: 0, padding: 0 }}>
          <Section
            title="Hostname"
            renderValue={renderHostname(nodeBalancer)}
          />
          <Section
            title="Region"
            renderValue={renderRegion(nodeBalancer)}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SummaryPanel);

const renderRegion =
  (nodeBalancer: Linode.ExtendedNodeBalancer): (props: any) => string | JSX.Element | null =>
    (props) => formatRegion(nodeBalancer.region);

const renderHostname =
  (nodeBalancer: Linode.ExtendedNodeBalancer): (props: any) => string | JSX.Element | null =>
    (props) => nodeBalancer.hostname;

const renderNodesStatus =
  (nodeBalancer: Linode.ExtendedNodeBalancer): (props: any) => string | JSX.Element | null =>
    (props) => `${nodeBalancer.up} up, ${nodeBalancer.down} down`;

const renderTransferred =
  (nodeBalancer: Linode.ExtendedNodeBalancer): (props: any) => string | JSX.Element | null =>
    (props) => convertMegabytesTo(nodeBalancer.transfer.total);

const renderIPv6 =
  (nodeBalancer: Linode.ExtendedNodeBalancer): (props: any) => string | JSX.Element | null =>
    (props) => <IPAddress ips={[nodeBalancer.ipv6!]} copyRight />;

const renderIPv4 =
  (nodeBalancer: Linode.ExtendedNodeBalancer): (props: any) => string | JSX.Element | null =>
    (props) => <IPAddress ips={[nodeBalancer.ipv4]} copyRight />;


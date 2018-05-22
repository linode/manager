import * as React from 'react';
import { compose } from 'ramda';
import * as Promise from 'bluebird';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
  Typography,
} from 'material-ui';
import Paper from 'material-ui/Paper';
import TableBody from 'material-ui/Table/TableBody';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';

import { getNodeBalancers, getNodeBalancerConfigs } from 'src/services/nodebalancers';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import Grid from 'src/components/Grid';
import Table from 'src/components/Table';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import NodeBalancerActionMenu from './NodeBalancerActionMenu';


type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

const preloaded = PromiseLoader<Props>({
  nodeBalancers: () => getNodeBalancersWithConfigs(),
});

// this is pretty tricky. we need to make a call to get the configs for each nodebalancer
// because the up and down time data lives in the configs along with the ports
//
// after we get that data, we have to add each config's up time together
// and each down time together
const getNodeBalancersWithConfigs = () => {
  return getNodeBalancers().then((response) => {
    return Promise.map(response, (nodeBalancer) => {
      return getNodeBalancerConfigs(nodeBalancer.id)
        .then(({ data: configs }) => {
          return {
            ...nodeBalancer,
            down: configs
              .reduce((acc: number, config) => {
                return acc + config.nodes_status.down;
              }, 0), // add the downtime for each config together
            up: configs
              .reduce((acc: number, config) => {
                return acc + config.nodes_status.up;
              }, 0), // add the uptime for each config together
            ports: configs
              .reduce((acc: [number], config) => {
                return [...acc, config.port];
              }, []),
          };
        })
        .catch(e => []);
    });
  });
};

interface Props { }

interface PreloadedProps {
  nodeBalancers: PromiseLoaderResponse<Linode.ExtendedNodeBalancer[]>;
}

interface State {
  deleteConfirmAlertOpen: boolean;
}

type CombinedProps = Props
  & WithStyles<ClassNames>
  & SetDocsProps
  & PreloadedProps;

export class NodeBalancersLanding extends React.Component<CombinedProps, State> {
  mounted: boolean = false;

  state: State = {
    deleteConfirmAlertOpen: false,
  };

  static docs = [
    {
      title: 'How to use NodeBalancers',
      src: 'https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers/',
      body: `Nearly all applications that are built using Linodes can benefit from load balancing,
       and load balancing itself is the key to expanding an application to larger numbers of users.
        Linode now provides NodeBalancers, which can ease the deployment
         and administration of a load balancer.`,
    },
    {
      title: 'NodeBalancer Reference Guide',
      src: 'https://www.linode.com/docs/platform/nodebalancer/nodebalancer-reference-guide/',
      body: `Check out the NodeBalacner reference guide for tips on how to successfully configure
      a NodeBalancer and get the most out of the service.`,
    },
  ];

  formatTransferData = (transferTotal: number) => {
    // API v4 always returns nodebalancer transfer in MB, so we want to clean it up if it's too
    // big or too small
    const gb = 1073741824;
    const mb = 1048576;
    const kb = 1024;
    const totalToBytes = transferTotal * 1024 * 1024; // convert the MB to Bytes
    if (totalToBytes >= gb) { // convert bytes to GB
      return `${Math.max(Math.ceil(totalToBytes / gb)).toFixed(2)} GB`;
    }
    if (totalToBytes >= mb) { // convert bytes to MB
      return `${Math.max(Math.ceil(totalToBytes / mb * 100) / 100).toFixed(2)} MB`;
    }
    if (totalToBytes >= kb) { // convert bytes to KB
      return `${Math.max(Math.ceil(totalToBytes / kb * 100) / 100).toFixed(2)} KB`;
    }
    return `${totalToBytes} bytes`;
  }

  render() {
    const { nodeBalancers, classes } = this.props;
    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Grid item xs={12}>
            <Typography
              variant="headline"
              className={classes.title}
              data-qa-title
            >
              NodeBalancers
        </Typography>
          </Grid>
        </Grid>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Node Status</TableCell>
                <TableCell>Transferred</TableCell>
                <TableCell>Ports</TableCell>
                <TableCell>IP Addresses</TableCell>
                <TableCell>Region</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nodeBalancers.response.map((nodeBalancer) => {
                return (
                  <TableRow key={nodeBalancer.id}>
                    <TableCell>{nodeBalancer.label}</TableCell>
                    <TableCell>{`${nodeBalancer.up} up, ${nodeBalancer.down} down`}</TableCell>
                    <TableCell>
                     {this.formatTransferData(nodeBalancer.transfer.total)}
                    </TableCell>
                    <TableCell>{nodeBalancer.ports.map((port, index, ports) => {
                      // we want a comma after the port number as long as the ports array
                      // has multiple values and the current index isn't the last
                      // element in the array
                      return (ports.length > 1 && index + 1 !== ports.length) ? `${port}, ` : port;
                    })}
                    </TableCell>
                    <TableCell>
                      <IPAddress ips={[nodeBalancer.ipv4]} copyRight />
                      {nodeBalancer.ipv6 && <IPAddress ips={[nodeBalancer.ipv6]} copyRight />}
                    </TableCell>
                    <TableCell>
                      <RegionIndicator region={nodeBalancer.region} />
                    </TableCell>
                    <TableCell>
                      <NodeBalancerActionMenu
                        nodeBalancerId={nodeBalancer.id}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export const enhanced = compose(
  styled,
  preloaded,
  SectionErrorBoundary,
  setDocs(NodeBalancersLanding.docs),
);

export default enhanced(NodeBalancersLanding);

import * as React from 'react';
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

import { compose } from 'ramda';

import * as Promise from 'bluebird';

import Grid from 'src/components/Grid';
import Table from 'src/components/Table';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';

import { getNodeBalancers, getNodeBalancerConfigs } from 'src/services/nodebalancers';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

const preloaded = PromiseLoader<Props>({
  nodeBalancers: () => getNodeBalancersWithConfigs(),
});

// this is pretty tricky. we need to make a call to get the configs for each nodebalancer
// because the up and downt time data lives in the configs
//
// after we get thata data, we have to add each config's up time together
// and each down time together
// so we need to end with a data set that looks like the following
// [{balancer_id: 1234, up: 2, down: 5}, {balancer_id: 421, up: 5, down: 5}]
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

class NodeBalancersLanding extends React.Component<CombinedProps, State> {
  mounted: boolean = false;

  state: State = {
    deleteConfirmAlertOpen: false,
  };

  static docs = [
    {
      title: 'Hello World',
      src: 'https://linode.com/docs/getting-started/',
      body: `This is a sentence. This is a sentence. This is a sentence. This is a sentence.
      This is a sentence. This is a sentence. This is a sentence. This is a sentence.
      This is a sentence. This is a sentence.`,
    },
    {
      title: 'Hello World',
      src: 'https://linode.com/docs/getting-started/',
      body: `This is a sentence. This is a sentence. This is a sentence. This is a sentence.
      This is a sentence. This is a sentence. This is a sentence. This is a sentence.
      This is a sentence. This is a sentence.`,
    },
  ];

  // componentDidMount() {
  //   this.mounted = true;

  //   const { nodeBalancers } = this.state;


  //   const nodeBalancersConfigStatuses: {} = {};
  //   nodeBalancers.map((nodeBalancer) => { // first map over all the nodebalancers we have
  //     getNodeBalancerConfigs(nodeBalancer.id) // get the configs for each balancer
  //       .then((response: Linode.ResourcePage<Linode.NodeBalancerConfig>) => {
  //         const uptime = response.data.reduce((acc: number, config
  // : Linode.NodeBalancerConfig) => {
  //           return acc + config.nodes_status.up;
  //         }, 0); // add the uptime for each config together
  //         const downtime = response
  //           .data
  //           .reduce((acc: number, config: Linode.NodeBalancerConfig) => {
  //             return acc + config.nodes_status.down;
  //           }, 0); // add the downtime for each config together
  //         const ports = response
  //           .data
  //           .reduce((acc: [number], config: Linode.NodeBalancerConfig) => {
  //             return [...acc, config.port];
  //           }, []);
  //         nodeBalancersConfigStatuses[nodeBalancer.id] = {
  //           up: uptime,
  //           down: downtime,
  //           ports,
  //         };
  //       });
  //   });
  //   this.setState({ nodeBalancersStatuses: nodeBalancersConfigStatuses });
  // }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { nodeBalancers } = this.props;
    console.log(nodeBalancers);
    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Grid item xs={12}>
            <Typography
              variant="headline"
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
              </TableRow>
            </TableHead>
            <TableBody>
              {nodeBalancers.response.map((nodeBalancer) => {
                return (
                  <TableRow key={nodeBalancer.id}>
                    <TableCell>{nodeBalancer.label}</TableCell>
                    <TableCell>{`${nodeBalancer.up} up, ${nodeBalancer.down} down`}</TableCell>
                    <TableCell>{nodeBalancer.transfer.total}</TableCell>
                    <TableCell>{nodeBalancer.ports.map((port, index, ports) => {
                      // we want a comma after the port number as long as the ports array
                      // has multiple values and the current index isn't the last
                      // element in the array
                      return (ports.length > 1 && index + 1 !== ports.length) ? `${port}, ` : port;
                    })}
                    </TableCell>
                    <TableCell>
                      <IPAddress ips={[nodeBalancer.ipv4]} copyRight />
                      <IPAddress ips={[nodeBalancer.ipv6]} copyRight />
                    </TableCell>
                    <TableCell>
                      <RegionIndicator region={nodeBalancer.region} />
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
  setDocs(NodeBalancersLanding.docs),
);

export default enhanced(NodeBalancersLanding);

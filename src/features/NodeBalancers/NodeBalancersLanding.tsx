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

import { compose, pathOr } from 'ramda';

import Grid from 'src/components/Grid';
import Table from 'src/components/Table';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';

import { getNodeBalancers, getNodeBalancerConfigs } from 'src/services/nodebalancers';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

const preloaded = PromiseLoader<Props>({
  nodeBalancers: () => getNodeBalancersWithConfigs(),
  // make a promise request ourside of preloaded
  // then combine the nodebalancer data and the
  // config information into one
  // look at linodesdetail
});

const getNodeBalancersWithConfigs = () => {
  return getNodeBalancers().then((response) => {
    return response.map((nodeBalancer) => {
      getNodeBalancerConfigs(nodeBalancer.id)
        .then((config: Linode.ResourcePage<Linode.NodeBalancerConfig>) => {
          console.log(nodeBalancer);
          return {
            nodeBalancer,
            down: config
              .data
              .reduce((acc: number, config: Linode.NodeBalancerConfig) => {
                return acc + config.nodes_status.down;
              }, 0), // add the downtime for each config together
            up: config
              .data
              .reduce((acc: number, config: Linode.NodeBalancerConfig) => {
                return acc + config.nodes_status.up;
              }, 0), // add the uptime for each config together
            ports: config
              .data
              .reduce((acc: [number], config: Linode.NodeBalancerConfig) => {
                return [...acc, config.port];
              }, []),
          };
        });
    });
  });
};

interface Props { }

interface PreloadedProps {
  nodeBalancers: PromiseLoaderResponse<Linode.NodeBalancer[]>;
}

interface State {
  deleteConfirmAlertOpen: boolean;
  nodeBalancers: Linode.NodeBalancer[];
  error?: Error;
  nodeBalancerConfigs: Linode.NodeBalancerConfig[] | null;
  nodeBalancersStatuses: {} | null;
}

type CombinedProps = Props
  & WithStyles<ClassNames>
  & SetDocsProps
  & PreloadedProps;

class NodeBalancersLanding extends React.Component<CombinedProps, State> {
  mounted: boolean = false;

  state: State = {
    deleteConfirmAlertOpen: false,
    nodeBalancers: pathOr([], ['response'], this.props.nodeBalancers),
    error: pathOr(undefined, ['error'], this.props.nodeBalancers),
    nodeBalancerConfigs: null,
    nodeBalancersStatuses: null,
    // will end up looking like [{balancer_id: xxx, up: xxx, down: xxx}, etc]
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

  //   // this is pretty tricky. we need to make a call to get the configs for each nodebalancer
  //   // because the up and downt time data lives in the configs
  //   //
  //   // after we get thata data, we have to add each config's up time together
  //   // and each down time together
  //   // so we need to end with a data set that looks like the following
  //   // [{balancer_id: 1234, up: 2, down: 5}, {balancer_id: 421, up: 5, down: 5}]
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
    // const { nodeBalancers } = this.props;
    // const { nodeBalancersStatuses } = this.state;
    console.log(this.props.nodeBalancers);
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
              <TableRow>
                <TableCell>fdsafdasf</TableCell>
                <TableCell></TableCell>
                <TableCell>fdasfs</TableCell>
                <TableCell>Yay</TableCell>
                <TableCell>Yay</TableCell>
                <TableCell>Yay</TableCell>
              </TableRow>
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

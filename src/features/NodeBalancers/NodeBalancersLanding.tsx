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

import Grid from 'src/components/Grid';
import Table from 'src/components/Table';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';

import { getNodeBalancers } from 'src/services/nodebalancers';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

const preloaded = PromiseLoader<Props>({
  nodeBalancers: () => getNodeBalancers(),
});

interface Props { }

interface PreloadedProps {
  nodeBalancers: PromiseLoaderResponse<Linode.NodeBalancer[]>;
}

interface State {
  deleteConfirmAlertOpen: boolean;
  // nodeBalancerConfigs: Linode.NodeBalancerConfig[];
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

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    console.log(this.props.nodeBalancers);
    const { nodeBalancers } = this.props;
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
              {nodeBalancers.response.map(nodeBalancer =>
                <TableRow key={nodeBalancer.id}>
                  <TableCell>{nodeBalancer.label}</TableCell>
                  <TableCell>Hello</TableCell>
                  <TableCell>World</TableCell>
                  <TableCell>Yay</TableCell>
                  <TableCell>Yay</TableCell>
                  <TableCell>Yay</TableCell>
                </TableRow>,
              )}
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

import * as React from 'react';
import { compose, path } from 'ramda';
import * as Promise from 'bluebird';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import {
  getNodeBalancers, getNodeBalancerConfigs,
  deleteNodeBalancer,
} from 'src/services/nodebalancers';
import Button from 'src/components/Button';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import { convertMegabytesTo } from 'src/utilities/convertMegabytesTo';

import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import Grid from 'src/components/Grid';
import Table from 'src/components/Table';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import NodeBalancerActionMenu from './NodeBalancerActionMenu';
import ErrorState from 'src/components/ErrorState';
import Placeholder from 'src/components/Placeholder';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root' | 'title' | 'NBStatus';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  NBStatus: {
    whiteSpace: 'nowrap',
  }
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

interface DeleteConfirmDialogState {
  open: boolean;
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
}

interface State {
  deleteConfirmDialog: DeleteConfirmDialogState;
  selectedNodeBalancerId?: number;
  nodeBalancers: Linode.ExtendedNodeBalancer[];
  errors?: Error;
}

type CombinedProps = Props
  & WithStyles<ClassNames>
  & RouteComponentProps<{}>
  & SetDocsProps
  & PreloadedProps;

export class NodeBalancersLanding extends React.Component<CombinedProps, State> {
  mounted: boolean = false;

  static defaultDeleteConfirmDialogState = {
    submitting: false,
    open: false,
    errors: undefined,
  };

  state: State = {
    deleteConfirmDialog: NodeBalancersLanding.defaultDeleteConfirmDialogState,
    nodeBalancers: this.props.nodeBalancers.response || [],
    errors: this.props.nodeBalancers.error || undefined,
  };

  static docs = [
    {
      title: 'Getting Started with NodeBalancers',
      src: 'https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers/',
      body: `Using a NodeBalancer to begin managing a simple web application`,
    },
    {
      title: 'NodeBalancer Reference Guide',
      src: 'https://www.linode.com/docs/platform/nodebalancer/nodebalancer-reference-guide/',
      body: `NodeBalancer Reference Guide`,
    },
  ];

  renderEmptyState = () => {
    return <Placeholder />;
  }

  toggleDialog = (nodeBalancerId: number) => {
    this.setState({
      selectedNodeBalancerId: nodeBalancerId,
      deleteConfirmDialog: {
        ...this.state.deleteConfirmDialog,
        open: !this.state.deleteConfirmDialog.open,
      },
    });
  }

  deleteNodeBalancer = () => {
    const { selectedNodeBalancerId } = this.state;
    this.setState({
      deleteConfirmDialog: {
        ...this.state.deleteConfirmDialog,
        errors: undefined,
        submitting: true,
      },
    });

    deleteNodeBalancer(selectedNodeBalancerId!)
      .then((response) => {
        getNodeBalancersWithConfigs()
          .then((response: Linode.ExtendedNodeBalancer[]) => {
            this.setState({
              nodeBalancers: response,
              deleteConfirmDialog: {
                open: false,
                submitting: false,
              },
            });
          });
      })
      .catch((err) => {
        const apiError = path<Linode.ApiFieldError[]>(['response', 'data', 'error'], err);

        return this.setState({
          deleteConfirmDialog: {
            ...this.state.deleteConfirmDialog,
            errors: apiError
              ? apiError
              : [{ field: 'none', reason: 'Unable to complete your request at this time.' }],
          },
        }, () => {
          scrollErrorIntoView();
        });
      });
  }

  render() {
    const {
      classes,
      history,
    } = this.props;

    const {
      nodeBalancers,
      errors,
      deleteConfirmDialog: {
        open: deleteConfirmAlertOpen,
      },
    } = this.state;

    /** Error State */
    if (errors) {
      return <ErrorState
        errorText="There was an error loading your NodeBalancers. Please try again later."
      />;
    }

    /** Empty State */
    if (nodeBalancers.length === 0) {
      return <Placeholder
        title="Add a NodeBalancer"
        copy="Adding a NodeBalancer is easy. Click below to add a NodeBalancer."
        buttonProps={{
          onClick: () => history.push('/nodebalancers/create'),
          children: 'Add a NodeBalancer',
        }}
      />;
    }

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Grid item>
            <Typography variant="headline" className={classes.title} data-qa-title >
              NodeBalancers
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item>
                <AddNewLink
                  onClick={() => history.push('/nodebalancers/create')}
                  label="Add a NodeBalancer"
                />
              </Grid>
            </Grid>
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
              {nodeBalancers.map((nodeBalancer) => {
                return (
                  <TableRow key={nodeBalancer.id} data-qa-nodebalancer-cell>
                    <TableCell data-qa-nodebalancer-label>
                      <Link to={`/nodebalancers/${nodeBalancer.id}`}>
                        {nodeBalancer.label}
                      </Link>
                    </TableCell>
                    <TableCell data-qa-node-status>
                    <span className={classes.NBStatus}>{nodeBalancer.up} up</span> <br /> 
                    <span className={classes.NBStatus}>{nodeBalancer.down} down</span>
                    </TableCell>
                    <TableCell data-qa-transferred>
                      {convertMegabytesTo(nodeBalancer.transfer.total)}
                    </TableCell>
                    <TableCell data-qa-ports>
                      {nodeBalancer.ports.length === 0 && 'None'}
                      {nodeBalancer.ports.join(', ')}
                    </TableCell>
                    <TableCell data-qa-nodebalancer-ips>
                      <IPAddress ips={[nodeBalancer.ipv4]} copyRight />
                      {nodeBalancer.ipv6 && <IPAddress ips={[nodeBalancer.ipv6]} copyRight />}
                    </TableCell>
                    <TableCell data-qa-region>
                      <RegionIndicator region={nodeBalancer.region} />
                    </TableCell>
                    <TableCell>
                      <NodeBalancerActionMenu
                        nodeBalancerId={nodeBalancer.id}
                        toggleDialog={this.toggleDialog}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
        <ConfirmationDialog
          onClose={() => this.setState({
            deleteConfirmDialog: NodeBalancersLanding.defaultDeleteConfirmDialogState,
          })}
          title="Confirm Deletion"
          error={(this.state.deleteConfirmDialog.errors || []).map(e => e.reason).join(',')}
          actions={({ onClose }) =>
            <ActionsPanel style={{ padding: 0 }}>
              <Button
                data-qa-confirm-cancel
                onClick={this.deleteNodeBalancer}
                type="secondary"
                destructive
                loading={this.state.deleteConfirmDialog.submitting}
              >
                Delete
              </Button>
              <Button
                onClick={() => onClose()}
                type="cancel"
                data-qa-cancel-cancel
              >
                Cancel
            </Button>
            </ActionsPanel>
          }
          open={deleteConfirmAlertOpen}
        >
          <Typography>Are you sure you want to delete your NodeBalancer</Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export const enhanced = compose(
  styled,
  preloaded,
  withRouter,
  SectionErrorBoundary,
  setDocs(NodeBalancersLanding.docs),
);

export default enhanced(NodeBalancersLanding);

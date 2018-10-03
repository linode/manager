import * as Promise from 'bluebird';
import { compose, path, pathOr } from 'ramda';
import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import Typography from '@material-ui/core/Typography';

import NodeBalancer from 'src/assets/addnewmenu/nodebalancer.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import PaginationFooter, { PaginationProps } from 'src/components/PaginationFooter';
import Placeholder from 'src/components/Placeholder';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowError from 'src/components/TableRowError';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { deleteNodeBalancer, getNodeBalancerConfigs, getNodeBalancers } from 'src/services/nodebalancers';
import { convertMegabytesTo } from 'src/utilities/convertMegabytesTo';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import scrollToTop from 'src/utilities/scrollToTop';

import NodeBalancerActionMenu from './NodeBalancerActionMenu';

type ClassNames = 'root'
  | 'title'
  | 'nodeStatus'
  | 'nameCell'
  | 'nodeStatus'
  | 'transferred'
  | 'ports'
  | 'ipsWrapper'
  | 'ip';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  nameCell: {
    width: '15%',
    minWidth: 150,
  },
  nodeStatus: {
    width: '10%',
    minWidth: 100,
  },
  transferred: {
    width: '10%',
    minWidth: 100,
  },
  ports: {
    width: '10%',
    minWidth: 50,
  },
  ipsWrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
  },
  ip: {
    width: '30%',
    minWidth: 200,
  },
});

interface DeleteConfirmDialogState {
  open: boolean;
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
}

interface State extends PaginationProps {
  deleteConfirmDialog: DeleteConfirmDialogState;
  errors?: Linode.ApiFieldError[];
  loading: boolean;
  nodeBalancers: Linode.ExtendedNodeBalancer[];
  selectedNodeBalancerId?: number;
}

type CombinedProps = WithStyles<ClassNames>
  & RouteComponentProps<{}>
  & SetDocsProps;

export class NodeBalancersLanding extends React.Component<CombinedProps, State> {
  mounted: boolean = false;

  static defaultDeleteConfirmDialogState = {
    submitting: false,
    open: false,
    errors: undefined,
  };

  state: State = {
    count: 0,
    deleteConfirmDialog: NodeBalancersLanding.defaultDeleteConfirmDialogState,
    loading: true,
    nodeBalancers: [],
    page: 1,
    pageSize: 25,
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

  componentDidMount() {
    this.mounted = true;
    this.requestNodeBalancers(undefined, undefined, true);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  requestNodeBalancers = (
    page: number = this.state.page,
    pageSize: number = this.state.pageSize,
    initial: boolean = false,
  ) => {

    this.setState({ loading: initial });
    // this is pretty tricky. we need to make a call to get the configs for each nodebalancer
    // because the up and down time data lives in the configs along with the ports
    //
    // after we get that data, we have to add each config's up time together
    // and each down time together
    return getNodeBalancers({ page, page_size: pageSize })
      .then((response) => {
        return new Promise((resolve, reject) => {
          Promise.map(response.data, (nodeBalancer) => getNodeBalancerConfigs(nodeBalancer.id)
            .then(({ data: configs }) => ({
              ...nodeBalancer,
              // add the downtime for each config together
              down: configs.reduce((acc: number, config) => acc + config.nodes_status.down, 0),
              // add the uptime for each config together
              up: configs.reduce((acc: number, config) => acc + config.nodes_status.up, 0),
              // generate a list of ports.
              ports: configs.reduce((acc: [number], config) => [...acc, config.port], []),
            })))
            .then((data) => resolve({ ...response, data }))
            .catch((error) => reject(error));
        });
      })
      .then((response: Linode.ResourcePage<Linode.ExtendedNodeBalancer>) => {
        this.setState({
          nodeBalancers: response.data,
          count: response.results,
          page: response.page,
          loading: false
        });
      })
      .catch((error) => {
        this.setState({
          loading: false,
          errors: pathOr([{ reason: 'Unable to load NodeBalancer data.' }], ['response', 'data', 'errors'], error),
        })
      });
  };

  handlePageChange = (page: number) => {
    this.setState({ page });
    this.requestNodeBalancers(page);
    scrollToTop();
  }

  handlePageSizeChange = (pageSize: number) => {
    this.setState({ pageSize });
    this.requestNodeBalancers(this.state.page, pageSize);
    scrollToTop();
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
        this.setState({
          nodeBalancers: this.state.nodeBalancers.filter((nodebalancer) => nodebalancer.id !== selectedNodeBalancerId),
          deleteConfirmDialog: {
            open: false,
            submitting: false,
          },
        });
      })
      .catch((err) => {
        const apiError = path<Linode.ApiFieldError[]>(['response', 'data', 'error'], err);

        return this.setState({
          deleteConfirmDialog: {
            ...this.state.deleteConfirmDialog,
            submitting: false,
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
    const { classes, history } = this.props;

    const {
      count,
      deleteConfirmDialog: {
        open: deleteConfirmAlertOpen,
      },
      loading,
      page,
      pageSize,
    } = this.state;

    if(loading){
      return this.renderLoading();
    }

    if (count === 0) {
      return this.renderEmpty()
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="NodeBalancers" />
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Grid item>
            <Typography role="header" variant="headline" className={classes.title} data-qa-title >
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
          <Table aria-label="List of NodeBalancers">
            <TableHead>
              <TableRow>
                <TableCell className={classes.nameCell}>Name</TableCell>
                <TableCell className={classes.nodeStatus} noWrap>Node Status</TableCell>
                <TableCell className={classes.transferred}>Transferred</TableCell>
                <TableCell className={classes.ports}>Ports</TableCell>
                <TableCell className={classes.ip} noWrap>IP Addresses</TableCell>
                <TableCell>Region</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderContent()}
            </TableBody>
          </Table>
        </Paper>
        <PaginationFooter
          count={count}
          page={page}
          pageSize={pageSize}
          handlePageChange={this.handlePageChange}
          handleSizeChange={this.handlePageSizeChange}
        />
        <ConfirmationDialog
          onClose={this.closeConfirmationDialog}
          title="Confirm Deletion"
          error={(this.state.deleteConfirmDialog.errors || []).map(e => e.reason).join(',')}
          actions={this.renderConfirmationDialogActions}
          open={deleteConfirmAlertOpen}
        >
          <Typography>Are you sure you want to delete your NodeBalancer</Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  renderConfirmationDialogActions = () => {
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          type="cancel"
          onClick={this.closeConfirmationDialog}
          data-qa-cancel-cancel
        >
          Cancel
        </Button>
        <Button
          data-qa-confirm-cancel
          onClick={this.deleteNodeBalancer}
          type="secondary"
          destructive
          loading={this.state.deleteConfirmDialog.submitting}
        >
          Delete
        </Button>
      </ActionsPanel>
    );
  }

  closeConfirmationDialog = () => this.setState({
    deleteConfirmDialog: NodeBalancersLanding.defaultDeleteConfirmDialogState,
  });
  renderContent = () => {
    const {
      count,
      errors,
      nodeBalancers,
    } = this.state;

    if (errors) {
      return this.renderErrors(errors);
    }

    if (nodeBalancers && count > 0) {
      return this.renderData(nodeBalancers);
    }

    return null;
  };

  renderLoading = () => {
    return (<CircleProgress />);
  };

  renderErrors = (errors: Linode.ApiFieldError[]) => {
    return <TableRowError message="There was an error loading your NodeBalancers. Please try again later." colSpan={7} />;
  };

  renderEmpty = () => {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="NodeBalancers" />
        <Placeholder
          title="Add a NodeBalancer"
          copy="Adding a NodeBalancer is easy. Click below to add a NodeBalancer."
          icon={NodeBalancer}
          buttonProps={{
            onClick: () => this.props.history.push('/nodebalancers/create'),
            children: 'Add a NodeBalancer',
          }}
        />
      </React.Fragment>
    );
  };

  renderData = (nodeBalancers: Linode.ExtendedNodeBalancer[]) => {
    const { classes } = this.props;

    return nodeBalancers.map((nodeBalancer) => {
      return (
        <TableRow
          key={nodeBalancer.id}
          data-qa-nodebalancer-cell
          rowLink={`/nodebalancers/${nodeBalancer.id}`}
          className="fade-in-table"
          arial-label={nodeBalancer.label}
        >
          <TableCell parentColumn="Name" data-qa-nodebalancer-label>
            <Link to={`/nodebalancers/${nodeBalancer.id}`}>
              {nodeBalancer.label}
            </Link>
          </TableCell>
          <TableCell parentColumn="Node Status" data-qa-node-status>
            <span>{nodeBalancer.up} up</span> <br />
            <span>{nodeBalancer.down} down</span>
          </TableCell>
          <TableCell parentColumn="Transferred" data-qa-transferred>
            {convertMegabytesTo(nodeBalancer.transfer.total)}
          </TableCell>
          <TableCell parentColumn="Ports" data-qa-ports>
            {nodeBalancer.ports.length === 0 && 'None'}
            {nodeBalancer.ports.join(', ')}
          </TableCell>
          <TableCell parentColumn="IP Addresses" data-qa-nodebalancer-ips>
            <div className={classes.ipsWrapper}>
              <IPAddress ips={[nodeBalancer.ipv4]} copyRight />
              {nodeBalancer.ipv6 && <IPAddress ips={[nodeBalancer.ipv6]} copyRight />}
            </div>
          </TableCell>
          <TableCell parentColumn="Region" data-qa-region>
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
    })
  }
};

const styled = withStyles(styles, { withTheme: true });

export const enhanced = compose(
  styled,
  withRouter,
  SectionErrorBoundary,
  setDocs(NodeBalancersLanding.docs),
);

export default enhanced(NodeBalancersLanding);

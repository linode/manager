import {
  NodeBalancer,
  NodeBalancerConfig
} from 'linode-js-sdk/lib/nodebalancers';
import { APIError } from 'linode-js-sdk/lib/types';
import { path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import FormControlLabel from 'src/components/core/FormControlLabel';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import Toggle from 'src/components/Toggle';
import {
  NodeBalancerGettingStarted,
  NodeBalancerReference
} from 'src/documentation';
import { ApplicationState } from 'src/store';
import {
  withNodeBalancerActions,
  WithNodeBalancerActions
} from 'src/store/nodeBalancer/nodeBalancer.containers';
import { nodeBalancersWithConfigs } from 'src/store/nodeBalancer/nodeBalancer.selectors';
import { sendGroupByTagEnabledEvent } from 'src/utilities/ga';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import ListGroupedNodeBalancers from './ListGroupedNodeBalancers';
import ListNodeBalancers from './ListNodeBalancers';
import NodeBalancersLandingEmptyState from './NodeBalancersLandingEmptyState';

import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';

type ClassNames =
  | 'root'
  | 'titleWrapper'
  | 'title'
  | 'nodeStatus'
  | 'nameCell'
  | 'nodeStatus'
  | 'transferred'
  | 'ports'
  | 'ip'
  | 'tagGroup';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    titleWrapper: {
      flex: 1
    },
    title: {
      marginBottom: theme.spacing(1) + theme.spacing(1) / 2
    },
    nameCell: {
      width: '15%',
      minWidth: 150
    },
    nodeStatus: {
      width: '10%',
      minWidth: 100
    },
    transferred: {
      width: '10%',
      minWidth: 100
    },
    ports: {
      width: '10%',
      minWidth: 50
    },
    ip: {
      width: '30%',
      minWidth: 200
    },
    tagGroup: {
      flexDirection: 'row-reverse',
      marginBottom: theme.spacing(1)
    }
  });

interface DeleteConfirmDialogState {
  open: boolean;
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
}

interface State {
  deleteConfirmDialog: DeleteConfirmDialogState;
  selectedNodeBalancerId?: number;
  selectedNodeBalancerLabel: string;
}

type CombinedProps = WithNodeBalancerActions &
  WithNodeBalancers &
  WithStyles<ClassNames> &
  RouteComponentProps<{}> &
  SetDocsProps;

export class NodeBalancersLanding extends React.Component<
  CombinedProps,
  State
> {
  static defaultDeleteConfirmDialogState = {
    submitting: false,
    open: false,
    errors: undefined
  };

  state: State = {
    deleteConfirmDialog: NodeBalancersLanding.defaultDeleteConfirmDialogState,
    selectedNodeBalancerLabel: ''
  };

  pollInterval: number;

  componentDidMount() {
    /**
     * To keep NB node status up to date, poll NodeBalancers and configs every 30 seconds while the
     * user is on this page.
     */
    const { getAllNodeBalancersWithConfigs } = this.props.nodeBalancerActions;
    this.pollInterval = window.setInterval(
      () => getAllNodeBalancersWithConfigs(),
      30 * 1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.pollInterval);
  }

  static docs = [NodeBalancerGettingStarted, NodeBalancerReference];

  toggleDialog = (nodeBalancerId: number, label: string) => {
    this.setState({
      selectedNodeBalancerId: nodeBalancerId,
      selectedNodeBalancerLabel: label,
      deleteConfirmDialog: {
        ...this.state.deleteConfirmDialog,
        open: !this.state.deleteConfirmDialog.open
      }
    });
  };

  onSubmitDelete = () => {
    const {
      nodeBalancerActions: { deleteNodeBalancer }
    } = this.props;
    const { selectedNodeBalancerId } = this.state;

    if (!selectedNodeBalancerId) {
      return;
    }

    this.setState({
      deleteConfirmDialog: {
        ...this.state.deleteConfirmDialog,
        errors: undefined,
        submitting: true
      }
    });

    deleteNodeBalancer({ nodeBalancerId: selectedNodeBalancerId })
      .then(_ => {
        this.setState({
          deleteConfirmDialog: {
            open: false,
            submitting: false
          }
        });
      })
      .catch(err => {
        const apiError = path<Linode.ApiFieldError[]>(
          ['response', 'data', 'error'],
          err
        );

        return this.setState(
          {
            deleteConfirmDialog: {
              ...this.state.deleteConfirmDialog,
              submitting: false,
              errors: apiError
                ? apiError
                : [
                    {
                      field: 'none',
                      reason: 'Unable to complete your request at this time.'
                    }
                  ]
            }
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  render() {
    const {
      classes,
      history,
      nodeBalancersCount,
      nodeBalancersLoading,
      nodeBalancersData,
      nodeBalancersError,
      location
    } = this.props;

    const {
      deleteConfirmDialog: { open: deleteConfirmAlertOpen }
    } = this.state;

    if (nodeBalancersError) {
      return <RenderError errors={nodeBalancersError} />;
    }

    if (nodeBalancersLoading) {
      return <LoadingState />;
    }

    if (nodeBalancersCount === 0) {
      return <NodeBalancersLandingEmptyState />;
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="NodeBalancers" />
        <PreferenceToggle<boolean>
          preferenceKey="nodebalancers_group_by_tag"
          preferenceOptions={[false, true]}
          localStorageKey="GROUP_NODEBALANCERS"
          toggleCallbackFnDebounced={toggleNodeBalancersGroupBy}
        >
          {({
            preference: nodeBalancersAreGrouped,
            togglePreference: toggleNodeBalancerGroupByTag
          }: ToggleProps<boolean>) => {
            return (
              <React.Fragment>
                <Grid
                  container
                  justify="space-between"
                  alignItems="flex-end"
                  style={{ paddingBottom: 0 }}
                >
                  <Grid item className={classes.titleWrapper}>
                    <Breadcrumb
                      pathname={location.pathname}
                      data-qa-title
                      labelTitle="NodeBalancers"
                      className={classes.title}
                    />
                  </Grid>
                  <Grid item className="p0">
                    <FormControlLabel
                      className={classes.tagGroup}
                      label="Group by Tag:"
                      control={
                        <Toggle
                          className={
                            nodeBalancersAreGrouped ? ' checked' : ' unchecked'
                          }
                          onChange={toggleNodeBalancerGroupByTag}
                          checked={nodeBalancersAreGrouped}
                        />
                      }
                    />
                  </Grid>
                  <Grid item>
                    <Grid
                      container
                      alignItems="flex-end"
                      style={{ width: 'auto' }}
                    >
                      <Grid item className="pt0">
                        <AddNewLink
                          onClick={() => history.push('/nodebalancers/create')}
                          label="Add a NodeBalancer"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <OrderBy
                  data={Object.values(nodeBalancersData)}
                  order={'desc'}
                  orderBy={`label`}
                >
                  {({
                    data: orderedData,
                    handleOrderChange,
                    order,
                    orderBy
                  }) => {
                    const props = {
                      data: orderedData,
                      handleOrderChange,
                      order,
                      orderBy,
                      toggleDialog: this.toggleDialog
                    };
                    return nodeBalancersAreGrouped ? (
                      <ListGroupedNodeBalancers {...props} />
                    ) : (
                      <ListNodeBalancers {...props} />
                    );
                  }}
                </OrderBy>
              </React.Fragment>
            );
          }}
        </PreferenceToggle>
        <ConfirmationDialog
          onClose={this.closeConfirmationDialog}
          title={`Delete ${this.state.selectedNodeBalancerLabel}?`}
          error={(this.state.deleteConfirmDialog.errors || [])
            .map(e => e.reason)
            .join(',')}
          actions={this.renderConfirmationDialogActions}
          open={deleteConfirmAlertOpen}
        >
          <Typography>
            Are you sure you want to delete your NodeBalancer?
          </Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  renderConfirmationDialogActions = () => {
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          buttonType="cancel"
          onClick={this.closeConfirmationDialog}
          data-qa-cancel-cancel
        >
          Cancel
        </Button>
        <Button
          data-qa-confirm-cancel
          onClick={this.onSubmitDelete}
          buttonType="secondary"
          destructive
          loading={this.state.deleteConfirmDialog.submitting}
        >
          Delete
        </Button>
      </ActionsPanel>
    );
  };

  closeConfirmationDialog = () =>
    this.setState({
      deleteConfirmDialog: NodeBalancersLanding.defaultDeleteConfirmDialogState
    });
}

const eventCategory = `nodebalancers landing`;

const toggleNodeBalancersGroupBy = (checked: boolean) =>
  sendGroupByTagEnabledEvent(eventCategory, checked);

const styled = withStyles(styles);

interface NodeBalancerWithConfigs extends NodeBalancer {
  configs: NodeBalancerConfig[];
}

interface WithNodeBalancers {
  nodeBalancersCount: number;
  nodeBalancersData: NodeBalancerWithConfigs[];
  nodeBalancersError?: Linode.ApiFieldError[];
  nodeBalancersLoading: boolean;
}

export const enhanced = compose<CombinedProps, {}>(
  connect((state: ApplicationState) => {
    const { __resources } = state;
    const { nodeBalancers } = __resources;
    const {
      error,
      items,
      loading: nodeBalancersLoading,
      lastUpdated
    } = nodeBalancers;

    return {
      nodeBalancersCount: items.length,
      nodeBalancersData: nodeBalancersWithConfigs(__resources),
      nodeBalancersError: path(['read'], error),
      // In this component we only want to show loading state on initial load
      nodeBalancersLoading: nodeBalancersLoading && lastUpdated === 0
    };
  }),
  withRouter,
  withNodeBalancerActions,
  SectionErrorBoundary,
  setDocs(NodeBalancersLanding.docs),
  styled
);

export default enhanced(NodeBalancersLanding);

const LoadingState = () => {
  return <CircleProgress />;
};

const RenderError = ({ errors }: { errors: APIError[] }) => {
  return (
    <ErrorState
      errorText={
        errors[0].reason ||
        'There was an error loading your NodeBalancers. Please try again later.'
      }
    />
  );
};

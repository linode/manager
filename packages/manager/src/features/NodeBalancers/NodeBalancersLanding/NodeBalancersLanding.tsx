import {
  NodeBalancer,
  NodeBalancerConfig
} from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
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
import EntityTable, {
  EntityTableRow,
  HeaderCell
} from 'src/components/EntityTable';
import EntityTable_CMR from 'src/components/EntityTable/EntityTable_CMR';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LandingHeader from 'src/components/LandingHeader';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import Toggle from 'src/components/Toggle';
import withFeatureFlagConsumerContainer, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container';
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
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { sendGroupByTagEnabledEvent } from 'src/utilities/ga';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import NodeBalancersLandingEmptyState from './NodeBalancersLandingEmptyState';
import NodeBalancerTableRow from './NodeBalancerTableRow';
import NodeBalancerTableRow_CMR from './NodeBalancerTableRow_CMR';

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
  errors?: APIError[];
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
  SetDocsProps &
  FeatureFlagConsumerProps;

const headers: HeaderCell[] = [
  {
    label: 'Name',
    dataColumn: 'label',
    sortable: true,
    widthPercent: 20
  },
  {
    label: 'Backend Status',
    dataColumn: 'status',
    sortable: false,
    widthPercent: 15,
    hideOnMobile: true
  },
  {
    label: 'Transferred',
    dataColumn: 'transfer:total',
    sortable: true,
    widthPercent: 5,
    hideOnMobile: true,
    hideOnTablet: true
  },
  {
    label: 'Ports',
    dataColumn: 'updated',
    sortable: true,
    widthPercent: 5,
    hideOnMobile: true,
    hideOnTablet: true
  },
  {
    label: 'IP Address',
    dataColumn: 'ip',
    sortable: false,
    widthPercent: 5
  },
  {
    label: 'Region',
    dataColumn: 'region',
    sortable: true,
    widthPercent: 5,
    hideOnMobile: true
  },
  {
    label: 'Action Menu',
    visuallyHidden: true,
    dataColumn: '',
    sortable: false,
    widthPercent: 5
  }
];

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
    const { getAllNodeBalancersWithConfigs } = this.props.nodeBalancerActions;
    /**
     * Normally we check for lastUpdated === 0 before requesting data,
     * but since this page is already polling every 30 seconds (@todo should it?),
     * it seems counterintuitive to make the first request conditional.
     */
    getAllNodeBalancersWithConfigs();
    /**
     * To keep NB node status up to date, poll NodeBalancers and configs every 30 seconds while the
     * user is on this page.
     */
    this.pollInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        getAllNodeBalancersWithConfigs();
      }
    }, 30 * 1000);
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
        return this.setState(
          {
            deleteConfirmDialog: {
              ...this.state.deleteConfirmDialog,
              submitting: false,
              errors: getAPIErrorOrDefault(
                err,
                'There was an error deleting this NodeBalancer.'
              )
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
      nodeBalancersLastUpdated,
      nodeBalancersError,
      location,
      flags
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

    const Table = flags.cmr ? EntityTable_CMR : EntityTable;

    const nodeBalancerRow: EntityTableRow<NodeBalancer> = {
      Component: flags.cmr ? NodeBalancerTableRow_CMR : NodeBalancerTableRow,
      data: Object.values(nodeBalancersData),
      handlers: { toggleDialog: this.toggleDialog },
      loading: nodeBalancersLoading,
      error: nodeBalancersError,
      lastUpdated: nodeBalancersLastUpdated
    };

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
                {this.props.flags.cmr ? (
                  <LandingHeader
                    title="NodeBalancers"
                    entity="NodeBalancer"
                    onAddNew={() =>
                      this.props.history.push('/nodebalancers/create')
                    }
                    createButtonWidth={190}
                    docsLink="https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers/"
                  />
                ) : (
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
                              nodeBalancersAreGrouped
                                ? ' checked'
                                : ' unchecked'
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
                            onClick={() =>
                              history.push('/nodebalancers/create')
                            }
                            label="Add a NodeBalancer"
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
                <Table
                  entity="nodebalancer"
                  groupByTag={nodeBalancersAreGrouped}
                  row={nodeBalancerRow}
                  headers={headers}
                  initialOrder={{ order: 'desc', orderBy: 'label' }}
                />
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
          buttonType="primary"
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
  nodeBalancersError?: APIError[];
  nodeBalancersLoading: boolean;
  nodeBalancersLastUpdated: number;
}

export const enhanced = compose<CombinedProps, {}>(
  connect((state: ApplicationState) => {
    const { __resources } = state;
    const { nodeBalancers } = __resources;
    const {
      error,
      results,
      loading: nodeBalancersLoading,
      lastUpdated
    } = nodeBalancers;

    return {
      nodeBalancersCount: results,
      nodeBalancersData: nodeBalancersWithConfigs(__resources),
      nodeBalancersError: path(['read'], error),
      // In this component we only want to show loading state on initial load
      nodeBalancersLoading: nodeBalancersLoading && lastUpdated === 0,
      nodeBalancersLastUpdated: lastUpdated
    };
  }),
  withFeatureFlagConsumerContainer,
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

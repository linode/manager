import {
  NodeBalancer,
  NodeBalancerConfig,
} from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
import { path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import EntityTable, {
  EntityTableRow,
  HeaderCell,
} from 'src/components/EntityTable';
import ErrorState from 'src/components/ErrorState';
import LandingHeader from 'src/components/LandingHeader';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import TransferDisplay from 'src/components/TransferDisplay';
import {
  NodeBalancerGettingStarted,
  NodeBalancerReference,
} from 'src/documentation';
import { ApplicationState } from 'src/store';
import {
  withNodeBalancerActions,
  WithNodeBalancerActions,
} from 'src/store/nodeBalancer/nodeBalancer.containers';
import { nodeBalancersWithConfigs } from 'src/store/nodeBalancer/nodeBalancer.selectors';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { sendGroupByTagEnabledEvent } from 'src/utilities/ga';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import NodeBalancersLandingEmptyState from './NodeBalancersLandingEmptyState';
import NodeBalancerTableRow from './NodeBalancerTableRow';

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
  RouteComponentProps<{}> &
  SetDocsProps;

const headers: HeaderCell[] = [
  {
    label: 'Name',
    dataColumn: 'label',
    sortable: true,
    widthPercent: 20,
  },
  {
    label: 'Backend Status',
    dataColumn: 'status',
    sortable: false,
    widthPercent: 15,
    hideOnMobile: true,
  },
  {
    label: 'Transferred',
    dataColumn: 'transfer:total',
    sortable: true,
    widthPercent: 5,
    hideOnMobile: true,
    hideOnTablet: true,
  },
  {
    label: 'Ports',
    dataColumn: 'updated',
    sortable: true,
    widthPercent: 5,
    hideOnMobile: true,
    hideOnTablet: true,
  },
  {
    label: 'IP Address',
    dataColumn: 'ip',
    sortable: false,
    widthPercent: 5,
  },
  {
    label: 'Region',
    dataColumn: 'region',
    sortable: true,
    widthPercent: 5,
    hideOnMobile: true,
  },
];

export class NodeBalancersLanding extends React.Component<
  CombinedProps,
  State
> {
  static defaultDeleteConfirmDialogState = {
    submitting: false,
    open: false,
    errors: undefined,
  };

  state: State = {
    deleteConfirmDialog: NodeBalancersLanding.defaultDeleteConfirmDialogState,
    selectedNodeBalancerLabel: '',
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
        open: !this.state.deleteConfirmDialog.open,
      },
    });
  };

  onSubmitDelete = () => {
    const {
      nodeBalancerActions: { deleteNodeBalancer },
    } = this.props;
    const { selectedNodeBalancerId } = this.state;

    if (!selectedNodeBalancerId) {
      return;
    }

    this.setState({
      deleteConfirmDialog: {
        ...this.state.deleteConfirmDialog,
        errors: undefined,
        submitting: true,
      },
    });

    deleteNodeBalancer({ nodeBalancerId: selectedNodeBalancerId })
      .then((_) => {
        this.setState({
          deleteConfirmDialog: {
            open: false,
            submitting: false,
          },
        });
      })
      .catch((err) => {
        return this.setState(
          {
            deleteConfirmDialog: {
              ...this.state.deleteConfirmDialog,
              submitting: false,
              errors: getAPIErrorOrDefault(
                err,
                'There was an error deleting this NodeBalancer.'
              ),
            },
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  render() {
    const {
      nodeBalancersCount,
      nodeBalancersLoading,
      nodeBalancersData,
      nodeBalancersLastUpdated,
      nodeBalancersError,
    } = this.props;

    const {
      deleteConfirmDialog: { open: deleteConfirmAlertOpen },
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

    const nodeBalancerRow: EntityTableRow<NodeBalancer> = {
      Component: NodeBalancerTableRow,
      data: Object.values(nodeBalancersData),
      handlers: { toggleDialog: this.toggleDialog },
      loading: nodeBalancersLoading,
      error: nodeBalancersError,
      lastUpdated: nodeBalancersLastUpdated,
    };

    return (
      <>
        <DocumentTitleSegment segment="NodeBalancers" />
        <PreferenceToggle<boolean>
          preferenceKey="nodebalancers_group_by_tag"
          preferenceOptions={[false, true]}
          localStorageKey="GROUP_NODEBALANCERS"
          toggleCallbackFnDebounced={toggleNodeBalancersGroupBy}
        >
          {({
            preference: nodeBalancersAreGrouped,
            togglePreference: toggleNodeBalancerGroupByTag,
          }: ToggleProps<boolean>) => {
            return (
              <>
                <LandingHeader
                  title="NodeBalancers"
                  entity="NodeBalancer"
                  onAddNew={() =>
                    this.props.history.push('/nodebalancers/create')
                  }
                  createButtonWidth={190}
                  docsLink="https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers/"
                />
                <EntityTable
                  entity="nodebalancer"
                  isGroupedByTag={nodeBalancersAreGrouped}
                  toggleGroupByTag={toggleNodeBalancerGroupByTag}
                  row={nodeBalancerRow}
                  headers={headers}
                  initialOrder={{ order: 'asc', orderBy: 'label' }}
                />
              </>
            );
          }}
        </PreferenceToggle>
        <TransferDisplay spacingTop={18} />
        <ConfirmationDialog
          onClose={this.closeConfirmationDialog}
          title={`Delete NodeBalancer ${this.state.selectedNodeBalancerLabel}?`}
          error={(this.state.deleteConfirmDialog.errors || [])
            .map((e) => e.reason)
            .join(',')}
          actions={this.renderConfirmationDialogActions}
          open={deleteConfirmAlertOpen}
        >
          <Typography>
            Are you sure you want to delete this NodeBalancer?
          </Typography>
        </ConfirmationDialog>
      </>
    );
  }

  renderConfirmationDialogActions = () => {
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          buttonType="secondary"
          onClick={this.closeConfirmationDialog}
          data-qa-cancel-cancel
        >
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={this.onSubmitDelete}
          loading={this.state.deleteConfirmDialog.submitting}
          data-qa-confirm-cancel
        >
          Delete NodeBalancer
        </Button>
      </ActionsPanel>
    );
  };

  closeConfirmationDialog = () =>
    this.setState({
      deleteConfirmDialog: NodeBalancersLanding.defaultDeleteConfirmDialogState,
    });
}

const eventCategory = `nodebalancers landing`;

const toggleNodeBalancersGroupBy = (checked: boolean) =>
  sendGroupByTagEnabledEvent(eventCategory, checked);

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
      lastUpdated,
    } = nodeBalancers;

    return {
      nodeBalancersCount: results,
      nodeBalancersData: nodeBalancersWithConfigs(__resources),
      nodeBalancersError: path(['read'], error),
      // In this component we only want to show loading state on initial load
      nodeBalancersLoading: nodeBalancersLoading && lastUpdated === 0,
      nodeBalancersLastUpdated: lastUpdated,
    };
  }),
  withRouter,
  withNodeBalancerActions,
  SectionErrorBoundary,
  setDocs(NodeBalancersLanding.docs)
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

import { Config } from '@linode/api-v4/lib/linodes/types';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { QueryClient } from 'react-query';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import Grid from '@mui/material/Unstable_Grid2';
import LandingHeader from 'src/components/LandingHeader';
import { MaintenanceBanner } from 'src/components/MaintenanceBanner/MaintenanceBanner';
import OrderBy from 'src/components/OrderBy';
import { PreferenceToggle } from 'src/components/PreferenceToggle/PreferenceToggle';
import {
  withProfile,
  WithProfileProps,
} from 'src/containers/profile.container';
import withFeatureFlagConsumer from 'src/containers/withFeatureFlagConsumer.container';
import { BackupsCTA } from 'src/features/Backups';
import { DialogType } from 'src/features/Linodes/types';
import { ApplicationState } from 'src/store';
import { deleteLinode } from 'src/store/linodes/linode.requests';
import { MapState } from 'src/store/types';
import {
  sendGroupByTagEnabledEvent,
  sendLinodesViewEvent,
} from 'src/utilities/analytics';
import { EnableBackupsDialog } from '../LinodesDetail/LinodeBackup/EnableBackupsDialog';
import { LinodeRebuildDialog } from '../LinodesDetail/LinodeRebuild/LinodeRebuildDialog';
import { MigrateLinode } from 'src/features/Linodes/MigrateLinode';
import { PowerActionsDialog, Action } from '../PowerActionsDialogOrDrawer';
import { linodesInTransition } from '../transitions';
import CardView from './CardView';
import DisplayGroupedLinodes from './DisplayGroupedLinodes';
import { DisplayLinodes } from './DisplayLinodes';
import styled, { StyleProps } from './LinodesLanding.styles';
import { LinodesLandingEmptyState } from './LinodesLandingEmptyState';
import ListView from './ListView';
import { ExtendedStatus, statusToPriority } from './utils';
import { LinodesLandingCSVDownload } from './LinodesLandingCSVDownload';
import { LinodeResize } from '../LinodesDetail/LinodeResize/LinodeResize';
import { RescueDialog } from '../LinodesDetail/LinodeRescue/RescueDialog';
import { DeleteLinodeDialog } from './DeleteLinodeDialog';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';
import { TransferDisplay } from 'src/components/TransferDisplay/TransferDisplay';
import type { PreferenceToggleProps } from 'src/components/PreferenceToggle/PreferenceToggle';
import {
  withEventsInfiniteQuery,
  WithEventsInfiniteQueryProps,
} from 'src/containers/events.container';

interface State {
  powerDialogOpen: boolean;
  powerDialogAction?: Action;
  enableBackupsDialogOpen: boolean;
  selectedLinodeConfigs?: Config[];
  selectedLinodeID?: number;
  selectedLinodeLabel?: string;
  deleteDialogOpen: boolean;
  rebuildDialogOpen: boolean;
  rescueDialogOpen: boolean;
  groupByTag: boolean;
  linodeResizeOpen: boolean;
  linodeMigrateOpen: boolean;
}

export interface LinodeHandlers {
  onOpenPowerDialog: (action: Action) => void;
  onOpenDeleteDialog: () => void;
  onOpenResizeDialog: () => void;
  onOpenRebuildDialog: () => void;
  onOpenRescueDialog: () => void;
  onOpenMigrateDialog: () => void;
}

interface Params {
  view?: string;
  groupByTag?: 'true' | 'false';
}

type RouteProps = RouteComponentProps<Params>;

export interface Props {
  LandingHeader?: React.ReactElement;
  someLinodesHaveScheduledMaintenance: boolean;
  linodesData: LinodeWithMaintenance[];
  linodesRequestError?: APIError[];
  linodesRequestLoading: boolean;
}

type CombinedProps = Props &
  StateProps &
  DispatchProps &
  RouteProps &
  StyleProps &
  WithProfileProps &
  WithEventsInfiniteQueryProps;

export class ListLinodes extends React.Component<CombinedProps, State> {
  state: State = {
    enableBackupsDialogOpen: false,
    powerDialogOpen: false,
    deleteDialogOpen: false,
    rebuildDialogOpen: false,
    rescueDialogOpen: false,
    groupByTag: false,
    linodeResizeOpen: false,
    linodeMigrateOpen: false,
  };

  /**
   * when you change the linode view, instantly update the query params
   */
  changeViewInstant = (style: 'grid' | 'list') => {
    const { history, location } = this.props;

    const query = new URLSearchParams(location.search);

    query.set('view', style);

    history.push(`?${query.toString()}`);
  };

  updatePageUrl = (page: number) => {
    this.props.history.push(`?page=${page}`);
  };

  /**
   * when you change the linode view, send analytics event, debounced.
   */
  changeViewDelayed = (style: 'grid' | 'list') => {
    sendLinodesViewEvent(eventCategory, style);
  };

  openPowerDialog = (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => {
    this.setState({
      powerDialogOpen: true,
      powerDialogAction: bootAction,
      selectedLinodeConfigs: linodeConfigs,
      selectedLinodeID: linodeID,
      selectedLinodeLabel: linodeLabel,
    });
  };

  openDialog = (type: DialogType, linodeID: number, linodeLabel?: string) => {
    switch (type) {
      case 'delete':
        this.setState({
          deleteDialogOpen: true,
        });
        break;
      case 'resize':
        this.setState({
          linodeResizeOpen: true,
        });
        break;
      case 'migrate':
        this.setState({
          linodeMigrateOpen: true,
        });
        break;
      case 'rebuild':
        this.setState({
          rebuildDialogOpen: true,
        });
        break;
      case 'rescue':
        this.setState({
          rescueDialogOpen: true,
        });
        break;
      case 'enable_backups':
        this.setState({
          enableBackupsDialogOpen: true,
        });
        break;
    }
    this.setState({
      selectedLinodeID: linodeID,
      selectedLinodeLabel: linodeLabel,
    });
  };

  closeDialogs = () => {
    this.setState({
      powerDialogOpen: false,
      deleteDialogOpen: false,
      rebuildDialogOpen: false,
      rescueDialogOpen: false,
      linodeResizeOpen: false,
      linodeMigrateOpen: false,
      enableBackupsDialogOpen: false,
    });
  };

  render() {
    const {
      linodesRequestError,
      linodesRequestLoading,
      linodesCount,
      linodesData,
      classes,
      events,
    } = this.props;

    const params = new URLSearchParams(this.props.location.search);

    const view =
      params.has('view') && ['grid', 'list'].includes(params.get('view')!)
        ? (params.get('view') as 'grid' | 'list')
        : undefined;

    const componentProps = {
      count: linodesCount,
      someLinodesHaveMaintenance: this.props
        .someLinodesHaveScheduledMaintenance,
      openPowerActionDialog: this.openPowerDialog,
      openDialog: this.openDialog,
    };

    if (linodesRequestError) {
      let errorText: string | JSX.Element =
        linodesRequestError?.[0]?.reason ?? 'Error loading Linodes';

      if (
        typeof errorText === 'string' &&
        errorText.toLowerCase() === 'this linode has been suspended'
      ) {
        errorText = (
          <React.Fragment>
            One or more of your Linodes is suspended. Please{' '}
            <Link to="/support/tickets">open a support ticket </Link>
            if you have questions.
          </React.Fragment>
        );
      }

      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Linodes" />
          <ErrorState errorText={errorText} />
        </React.Fragment>
      );
    }

    if (linodesRequestLoading) {
      return <CircleProgress />;
    }

    if (this.props.linodesCount === 0) {
      return <LinodesLandingEmptyState />;
    }

    return (
      <React.Fragment>
        <LinodeResize
          open={this.state.linodeResizeOpen}
          onClose={this.closeDialogs}
          linodeId={this.state.selectedLinodeID}
        />
        <MigrateLinode
          open={this.state.linodeMigrateOpen}
          onClose={this.closeDialogs}
          linodeId={this.state.selectedLinodeID ?? -1}
        />
        <LinodeRebuildDialog
          open={this.state.rebuildDialogOpen}
          onClose={this.closeDialogs}
          linodeId={this.state.selectedLinodeID ?? -1}
        />
        <RescueDialog
          open={this.state.rescueDialogOpen}
          onClose={this.closeDialogs}
          linodeId={this.state.selectedLinodeID ?? -1}
        />
        <EnableBackupsDialog
          open={this.state.enableBackupsDialogOpen}
          onClose={this.closeDialogs}
          linodeId={this.state.selectedLinodeID ?? -1}
        />
        {this.props.someLinodesHaveScheduledMaintenance && (
          <MaintenanceBanner />
        )}
        <DocumentTitleSegment segment="Linodes" />
        <PreferenceToggle<boolean>
          localStorageKey="GROUP_LINODES"
          preferenceOptions={[false, true]}
          preferenceKey="linodes_group_by_tag"
          toggleCallbackFnDebounced={sendGroupByAnalytic}
        >
          {({
            preference: linodesAreGrouped,
            togglePreference: toggleGroupLinodes,
          }: PreferenceToggleProps<boolean>) => {
            return (
              <PreferenceToggle<'grid' | 'list'>
                preferenceKey="linodes_view_style"
                localStorageKey="LINODE_VIEW"
                preferenceOptions={['list', 'grid']}
                toggleCallbackFnDebounced={this.changeViewDelayed}
                toggleCallbackFn={this.changeViewInstant}
                /**
                 * we want the URL query param to take priority here, but if it's
                 * undefined, just use the user preference
                 */
                value={view}
              >
                {({
                  preference: linodeViewPreference,
                  togglePreference: toggleLinodeView,
                }: PreferenceToggleProps<'list' | 'grid'>) => {
                  return (
                    <React.Fragment>
                      <React.Fragment>
                        <BackupsCTA />
                        {this.props.LandingHeader ? (
                          this.props.LandingHeader
                        ) : (
                          <div>
                            <LandingHeader
                              title="Linodes"
                              entity="Linode"
                              onButtonClick={() =>
                                this.props.history.push('/linodes/create')
                              }
                              docsLink="https://www.linode.com/docs/platform/billing-and-support/linode-beginners-guide/"
                            />
                          </div>
                        )}
                      </React.Fragment>

                      <OrderBy
                        preferenceKey={'linodes-landing'}
                        data={(linodesData ?? []).map((linode) => {
                          // Determine the priority of this Linode's status.
                          // We have to check for "Maintenance" and "Busy" since these are
                          // not actual Linode statuses (we derive them client-side).
                          let _status: ExtendedStatus = linode.status;
                          if (linode.maintenance) {
                            _status = 'maintenance';
                          } else if (
                            linodesInTransition(events ?? []).has(linode.id)
                          ) {
                            _status = 'busy';
                          }

                          return {
                            ...linode,
                            displayStatus: linode.maintenance
                              ? 'maintenance'
                              : linode.status,
                            _statusPriority: statusToPriority(_status),
                          };
                        })}
                        // If there are Linodes with scheduled maintenance, default to
                        // sorting by status priority so they are more visible.
                        order="asc"
                        orderBy={
                          this.props.someLinodesHaveScheduledMaintenance
                            ? '_statusPriority'
                            : 'label'
                        }
                      >
                        {({ data, handleOrderChange, order, orderBy }) => {
                          const finalProps = {
                            ...componentProps,
                            data,
                            handleOrderChange,
                            order,
                            orderBy,
                          };

                          return linodesAreGrouped ? (
                            <DisplayGroupedLinodes
                              {...finalProps}
                              display={linodeViewPreference}
                              toggleLinodeView={toggleLinodeView}
                              toggleGroupLinodes={toggleGroupLinodes}
                              linodesAreGrouped={true}
                              linodeViewPreference={linodeViewPreference}
                              component={
                                linodeViewPreference === 'grid'
                                  ? CardView
                                  : ListView
                              }
                            />
                          ) : (
                            <DisplayLinodes
                              {...finalProps}
                              display={linodeViewPreference}
                              toggleLinodeView={toggleLinodeView}
                              toggleGroupLinodes={toggleGroupLinodes}
                              updatePageUrl={this.updatePageUrl}
                              linodesAreGrouped={false}
                              linodeViewPreference={linodeViewPreference}
                              component={
                                linodeViewPreference === 'grid'
                                  ? CardView
                                  : ListView
                              }
                            />
                          );
                        }}
                      </OrderBy>
                      <Grid
                        container
                        className={classes.CSVwrapper}
                        justifyContent="flex-end"
                      >
                        <Grid className={classes.CSVlinkContainer}>
                          <LinodesLandingCSVDownload />
                        </Grid>
                      </Grid>
                    </React.Fragment>
                  );
                }}
              </PreferenceToggle>
            );
          }}
        </PreferenceToggle>
        <TransferDisplay />

        {!!this.state.selectedLinodeID && !!this.state.selectedLinodeLabel && (
          <React.Fragment>
            <PowerActionsDialog
              isOpen={this.state.powerDialogOpen}
              action={this.state.powerDialogAction ?? 'Power On'}
              linodeId={this.state.selectedLinodeID}
              onClose={this.closeDialogs}
            />
            <DeleteLinodeDialog
              open={this.state.deleteDialogOpen}
              onClose={this.closeDialogs}
              linodeId={this.state.selectedLinodeID}
            />
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

const eventCategory = 'linodes landing';

const sendGroupByAnalytic = (value: boolean) => {
  sendGroupByTagEnabledEvent(eventCategory, value);
};

interface StateProps {
  linodesCount: number;
}

const mapStateToProps: MapState<StateProps, Props> = (state) => {
  return {
    linodesCount: state.__resources.linodes.results,
  };
};

interface DispatchProps {
  deleteLinode: (
    linodeId: number,
    queryClient: QueryClient
  ) => Promise<Record<string, never>>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  deleteLinode: (linodeId: number, queryClient: QueryClient) =>
    dispatch(deleteLinode({ linodeId, queryClient })),
});

const connected = connect(mapStateToProps, mapDispatchToProps);

export const enhanced = compose<CombinedProps, Props>(
  withRouter,
  connected,
  styled,
  withFeatureFlagConsumer,
  withProfile,
  withEventsInfiniteQuery()
);

export default enhanced(ListLinodes);

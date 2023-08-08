import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { MaintenanceBanner } from 'src/components/MaintenanceBanner/MaintenanceBanner';
import OrderBy from 'src/components/OrderBy';
import { PreferenceToggle } from 'src/components/PreferenceToggle/PreferenceToggle';
import { TransferDisplay } from 'src/components/TransferDisplay/TransferDisplay';
import {
  WithProfileProps,
  withProfile,
} from 'src/containers/profile.container';
import withFeatureFlagConsumer from 'src/containers/withFeatureFlagConsumer.container';
import { BackupsCTA } from 'src/features/Backups/BackupsCTA';
import { MigrateLinode } from 'src/features/Linodes/MigrateLinode';
import { DialogType } from 'src/features/Linodes/types';
import {
  sendGroupByTagEnabledEvent,
  sendLinodesViewEvent,
} from 'src/utilities/analytics';
import { LinodeWithMaintenance } from 'src/utilities/linodes';

import { EnableBackupsDialog } from '../LinodesDetail/LinodeBackup/EnableBackupsDialog';
import { LinodeRebuildDialog } from '../LinodesDetail/LinodeRebuild/LinodeRebuildDialog';
import { RescueDialog } from '../LinodesDetail/LinodeRescue/RescueDialog';
import { LinodeResize } from '../LinodesDetail/LinodeResize/LinodeResize';
import { Action, PowerActionsDialog } from '../PowerActionsDialogOrDrawer';
import { linodesInTransition as _linodesInTransition } from '../transitions';
import CardView from './CardView';
import { DeleteLinodeDialog } from './DeleteLinodeDialog';
import DisplayGroupedLinodes from './DisplayGroupedLinodes';
import { DisplayLinodes } from './DisplayLinodes';
import {
  StyledLinkContainerGrid,
  StyledWrapperGrid,
} from './LinodesLanding.styles';
import { LinodesLandingCSVDownload } from './LinodesLandingCSVDownload';
import { LinodesLandingEmptyState } from './LinodesLandingEmptyState';
import ListView from './ListView';
import { ExtendedStatus, statusToPriority } from './utils';

import type { Config } from '@linode/api-v4/lib/linodes/types';
import type { APIError } from '@linode/api-v4/lib/types';
import type { PreferenceToggleProps } from 'src/components/PreferenceToggle/PreferenceToggle';
import type { MapState } from 'src/store/types';

interface State {
  deleteDialogOpen: boolean;
  enableBackupsDialogOpen: boolean;
  groupByTag: boolean;
  linodeMigrateOpen: boolean;
  linodeResizeOpen: boolean;
  powerDialogAction?: Action;
  powerDialogOpen: boolean;
  rebuildDialogOpen: boolean;
  rescueDialogOpen: boolean;
  selectedLinodeConfigs?: Config[];
  selectedLinodeID?: number;
  selectedLinodeLabel?: string;
}

export interface LinodeHandlers {
  onOpenDeleteDialog: () => void;
  onOpenMigrateDialog: () => void;
  onOpenPowerDialog: (action: Action) => void;
  onOpenRebuildDialog: () => void;
  onOpenRescueDialog: () => void;
  onOpenResizeDialog: () => void;
}

interface Params {
  groupByTag?: 'false' | 'true';
  view?: string;
}

type RouteProps = RouteComponentProps<Params>;

export interface LinodesLandingProps {
  LandingHeader?: React.ReactElement;
  linodesData: LinodeWithMaintenance[];
  linodesRequestError?: APIError[];
  linodesRequestLoading: boolean;
  someLinodesHaveScheduledMaintenance: boolean;
}

type CombinedProps = LinodesLandingProps &
  StateProps &
  RouteProps &
  WithProfileProps;

class ListLinodes extends React.Component<CombinedProps, State> {
  render() {
    const {
      linodesData,
      linodesInTransition,
      linodesRequestError,
      linodesRequestLoading,
    } = this.props;

    const params = new URLSearchParams(this.props.location.search);

    const view =
      params.has('view') && ['grid', 'list'].includes(params.get('view')!)
        ? (params.get('view') as 'grid' | 'list')
        : undefined;

    const componentProps = {
      openDialog: this.openDialog,
      openPowerActionDialog: this.openPowerDialog,
      someLinodesHaveMaintenance: this.props
        .someLinodesHaveScheduledMaintenance,
    };

    if (linodesRequestError) {
      let errorText: JSX.Element | string =
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

    if (this.props.linodesData.length === 0) {
      return <LinodesLandingEmptyState />;
    }

    return (
      <React.Fragment>
        <LinodeResize
          linodeId={this.state.selectedLinodeID}
          onClose={this.closeDialogs}
          open={this.state.linodeResizeOpen}
        />
        <MigrateLinode
          linodeId={this.state.selectedLinodeID ?? -1}
          onClose={this.closeDialogs}
          open={this.state.linodeMigrateOpen}
        />
        <LinodeRebuildDialog
          linodeId={this.state.selectedLinodeID ?? -1}
          onClose={this.closeDialogs}
          open={this.state.rebuildDialogOpen}
        />
        <RescueDialog
          linodeId={this.state.selectedLinodeID ?? -1}
          onClose={this.closeDialogs}
          open={this.state.rescueDialogOpen}
        />
        <EnableBackupsDialog
          linodeId={this.state.selectedLinodeID ?? -1}
          onClose={this.closeDialogs}
          open={this.state.enableBackupsDialogOpen}
        />
        {this.props.someLinodesHaveScheduledMaintenance && (
          <MaintenanceBanner />
        )}
        <DocumentTitleSegment segment="Linodes" />
        <PreferenceToggle<boolean>
          localStorageKey="GROUP_LINODES"
          preferenceKey="linodes_group_by_tag"
          preferenceOptions={[false, true]}
          toggleCallbackFnDebounced={sendGroupByAnalytic}
        >
          {({
            preference: linodesAreGrouped,
            togglePreference: toggleGroupLinodes,
          }: PreferenceToggleProps<boolean>) => {
            return (
              <PreferenceToggle<'grid' | 'list'>
                localStorageKey="LINODE_VIEW"
                preferenceKey="linodes_view_style"
                preferenceOptions={['list', 'grid']}
                toggleCallbackFn={this.changeViewInstant}
                toggleCallbackFnDebounced={this.changeViewDelayed}
                /**
                 * we want the URL query param to take priority here, but if it's
                 * undefined, just use the user preference
                 */
                value={view}
              >
                {({
                  preference: linodeViewPreference,
                  togglePreference: toggleLinodeView,
                }: PreferenceToggleProps<'grid' | 'list'>) => {
                  return (
                    <React.Fragment>
                      <React.Fragment>
                        <BackupsCTA />
                        {this.props.LandingHeader ? (
                          this.props.LandingHeader
                        ) : (
                          <div>
                            <LandingHeader
                              onButtonClick={() =>
                                this.props.history.push('/linodes/create')
                              }
                              docsLink="https://www.linode.com/docs/platform/billing-and-support/linode-beginners-guide/"
                              entity="Linode"
                              title="Linodes"
                            />
                          </div>
                        )}
                      </React.Fragment>

                      <OrderBy
                        data={(linodesData ?? []).map((linode) => {
                          // Determine the priority of this Linode's status.
                          // We have to check for "Maintenance" and "Busy" since these are
                          // not actual Linode statuses (we derive them client-side).
                          let _status: ExtendedStatus = linode.status;
                          if (linode.maintenance) {
                            _status = 'maintenance';
                          } else if (linodesInTransition.has(linode.id)) {
                            _status = 'busy';
                          }

                          return {
                            ...linode,
                            _statusPriority: statusToPriority(_status),
                            displayStatus: linode.maintenance
                              ? 'maintenance'
                              : linode.status,
                          };
                        })}
                        orderBy={
                          this.props.someLinodesHaveScheduledMaintenance
                            ? '_statusPriority'
                            : 'label'
                        }
                        // If there are Linodes with scheduled maintenance, default to
                        // sorting by status priority so they are more visible.
                        order="asc"
                        preferenceKey={'linodes-landing'}
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
                              component={
                                linodeViewPreference === 'grid'
                                  ? CardView
                                  : ListView
                              }
                              display={linodeViewPreference}
                              linodeViewPreference={linodeViewPreference}
                              linodesAreGrouped={true}
                              toggleGroupLinodes={toggleGroupLinodes}
                              toggleLinodeView={toggleLinodeView}
                            />
                          ) : (
                            <DisplayLinodes
                              {...finalProps}
                              component={
                                linodeViewPreference === 'grid'
                                  ? CardView
                                  : ListView
                              }
                              display={linodeViewPreference}
                              linodeViewPreference={linodeViewPreference}
                              linodesAreGrouped={false}
                              toggleGroupLinodes={toggleGroupLinodes}
                              toggleLinodeView={toggleLinodeView}
                              updatePageUrl={this.updatePageUrl}
                            />
                          );
                        }}
                      </OrderBy>
                      <StyledWrapperGrid container justifyContent="flex-end">
                        <StyledLinkContainerGrid>
                          <LinodesLandingCSVDownload />
                        </StyledLinkContainerGrid>
                      </StyledWrapperGrid>
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
              action={this.state.powerDialogAction ?? 'Power On'}
              isOpen={this.state.powerDialogOpen}
              linodeId={this.state.selectedLinodeID}
              onClose={this.closeDialogs}
            />
            <DeleteLinodeDialog
              linodeId={this.state.selectedLinodeID}
              onClose={this.closeDialogs}
              open={this.state.deleteDialogOpen}
            />
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }

  /**
   * when you change the linode view, send analytics event, debounced.
   */
  changeViewDelayed = (style: 'grid' | 'list') => {
    sendLinodesViewEvent(eventCategory, style);
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

  closeDialogs = () => {
    this.setState({
      deleteDialogOpen: false,
      enableBackupsDialogOpen: false,
      linodeMigrateOpen: false,
      linodeResizeOpen: false,
      powerDialogOpen: false,
      rebuildDialogOpen: false,
      rescueDialogOpen: false,
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

  openPowerDialog = (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => {
    this.setState({
      powerDialogAction: bootAction,
      powerDialogOpen: true,
      selectedLinodeConfigs: linodeConfigs,
      selectedLinodeID: linodeID,
      selectedLinodeLabel: linodeLabel,
    });
  };

  state: State = {
    deleteDialogOpen: false,
    enableBackupsDialogOpen: false,
    groupByTag: false,
    linodeMigrateOpen: false,
    linodeResizeOpen: false,
    powerDialogOpen: false,
    rebuildDialogOpen: false,
    rescueDialogOpen: false,
  };

  updatePageUrl = (page: number) => {
    this.props.history.push(`?page=${page}`);
  };
}

const eventCategory = 'linodes landing';

const sendGroupByAnalytic = (value: boolean) => {
  sendGroupByTagEnabledEvent(eventCategory, value);
};

interface StateProps {
  linodesInTransition: Set<number>;
}

const mapStateToProps: MapState<StateProps, LinodesLandingProps> = (state) => {
  return {
    linodesInTransition: _linodesInTransition(state.events.events),
  };
};

const connected = connect(mapStateToProps, undefined);

export const enhanced = compose<CombinedProps, LinodesLandingProps>(
  withRouter,
  connected,
  withFeatureFlagConsumer,
  withProfile
);

export default enhanced(ListLinodes);

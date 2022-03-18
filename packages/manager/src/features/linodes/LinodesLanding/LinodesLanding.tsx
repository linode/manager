import { Config, Linode } from '@linode/api-v4/lib/linodes/types';
import { APIError } from '@linode/api-v4/lib/types';
import { DateTime } from 'luxon';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { parse, stringify } from 'qs';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import CircleProgress from 'src/components/CircleProgress';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import CSVLink from 'src/components/DownloadCSV';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LandingHeader from 'src/components/LandingHeader';
import MaintenanceBanner from 'src/components/MaintenanceBanner';
import OrderBy from 'src/components/OrderBy';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import TransferDisplay from 'src/components/TransferDisplay';
import withFeatureFlagConsumer from 'src/containers/withFeatureFlagConsumer.container';
import withImages, { WithImages } from 'src/containers/withImages.container';
import { LinodeGettingStarted, SecuringYourServer } from 'src/documentation';
import { BackupsCTA } from 'src/features/Backups';
import { DialogType } from 'src/features/linodes/types';
import { ApplicationState } from 'src/store';
import { deleteLinode } from 'src/store/linodes/linode.requests';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';
import { MapState } from 'src/store/types';
import formatDate, { formatDateISO } from 'src/utilities/formatDate';
import {
  sendGroupByTagEnabledEvent,
  sendLinodesViewEvent,
} from 'src/utilities/ga';
import getLinodeDescription from 'src/utilities/getLinodeDescription';
import EnableBackupsDialog from '../LinodesDetail/LinodeBackup/EnableBackupsDialog';
import LinodeRebuildDialog from '../LinodesDetail/LinodeRebuild/LinodeRebuildDialog';
import RescueDialog from '../LinodesDetail/LinodeRescue';
import LinodeResize from '../LinodesDetail/LinodeResize';
import MigrateLinode from '../MigrateLanding/MigrateLinode';
import PowerDialogOrDrawer, { Action } from '../PowerActionsDialogOrDrawer';
import { linodesInTransition as _linodesInTransition } from '../transitions';
import CardView from './CardView';
import DeleteDialog from './DeleteDialog';
import DisplayGroupedLinodes from './DisplayGroupedLinodes';
import DisplayLinodes from './DisplayLinodes';
import styled, { StyleProps } from './LinodesLanding.styles';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import ListView from './ListView';
import { ExtendedStatus, statusToPriority } from './utils';

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

interface Params {
  view?: string;
  groupByTag?: 'true' | 'false';
}

type RouteProps = RouteComponentProps<Params>;

export interface Props {
  filterLinodesFn?: (linode: Linode) => boolean;
  extendLinodesFn?: (linode: Linode) => any;
  LandingHeader?: React.ReactElement;
  someLinodesHaveScheduledMaintenance: boolean;
  linodesData: LinodeWithMaintenance[];
  linodesRequestError?: APIError[];
  linodesRequestLoading: boolean;
}

type CombinedProps = Props &
  WithImages &
  StateProps &
  DispatchProps &
  RouteProps &
  StyleProps &
  SetDocsProps &
  WithSnackbarProps;

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

  static docs = [LinodeGettingStarted, SecuringYourServer];

  /**
   * when you change the linode view, instantly update the query params
   */
  changeViewInstant = (style: 'grid' | 'list') => {
    const { history, location } = this.props;

    const updatedParams = updateParams(location.search, (params) => ({
      ...params,
      view: style,
    }));

    history.push(`?${updatedParams}`);
  };

  updatePageUrl = (page: number) => {
    this.props.history.push(`?page=${page}`);
  };

  /**
   * when you change the linode view, send an event to google analytics, debounced.
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
      imagesError,
      imagesLoading,
      linodesRequestError,
      linodesRequestLoading,
      linodesCount,
      linodesData,
      classes,
      linodesInTransition,
    } = this.props;

    const params: Params = parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });

    // Filter the Linodes according to the `filterLinodesFn` prop (if it exists).
    const filteredLinodes = this.props.filterLinodesFn
      ? linodesData.filter(this.props.filterLinodesFn)
      : linodesData;

    const extendedLinodes = this.props.extendLinodesFn
      ? filteredLinodes.map(this.props.extendLinodesFn)
      : filteredLinodes;

    const componentProps = {
      count: linodesCount,
      someLinodesHaveMaintenance: this.props
        .someLinodesHaveScheduledMaintenance,
      openPowerActionDialog: this.openPowerDialog,
      openDialog: this.openDialog,
    };

    if (imagesError.read || linodesRequestError) {
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

    if (linodesRequestLoading || imagesLoading) {
      return <CircleProgress />;
    }

    if (this.props.linodesCount === 0) {
      return <ListLinodesEmptyState />;
    }

    const headers = [
      { label: 'Label', key: 'linodeDescription' },
      { label: 'Linode ID', key: 'id' },
      { label: 'Image', key: 'image' },
      { label: 'Region', key: 'region' },
      { label: 'Created', key: 'created' },
      { label: 'Last Backup', key: 'lastBackup' },
    ];

    return (
      <React.Fragment>
        <LinodeResize
          open={this.state.linodeResizeOpen}
          onClose={this.closeDialogs}
          linodeId={this.state.selectedLinodeID}
          linodeLabel={
            this.props.linodesData.find(
              (thisLinode) => thisLinode.id === this.state.selectedLinodeID
            )?.label ?? undefined
          }
        />
        <MigrateLinode
          open={this.state.linodeMigrateOpen}
          onClose={this.closeDialogs}
          linodeID={this.state.selectedLinodeID ?? -1}
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
        <Grid container className={classes.root}>
          <Grid item xs={12}>
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
              }: ToggleProps<boolean>) => {
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
                    value={
                      params.view === 'grid' || params.view === 'list'
                        ? params.view
                        : undefined
                    }
                  >
                    {({
                      preference: linodeViewPreference,
                      togglePreference: toggleLinodeView,
                    }: ToggleProps<'list' | 'grid'>) => {
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
                                  onAddNew={() =>
                                    this.props.history.push('/linodes/create')
                                  }
                                  docsLink="https://www.linode.com/docs/platform/billing-and-support/linode-beginners-guide/"
                                />
                              </div>
                            )}
                          </React.Fragment>

                          <Grid item xs={12}>
                            <OrderBy
                              preferenceKey={'linodes-landing'}
                              data={extendedLinodes.map((linode) => {
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
                              {({
                                data,
                                handleOrderChange,
                                order,
                                orderBy,
                              }) => {
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
                              <Grid item className={classes.CSVlinkContainer}>
                                <CSVLink
                                  data={linodesData.map((e) => {
                                    const maintenance = e.maintenance?.when
                                      ? {
                                          ...e.maintenance,
                                          when: formatDateISO(
                                            e.maintenance?.when
                                          ),
                                        }
                                      : { when: null };

                                    const lastBackup =
                                      e.backups.last_successful === null
                                        ? e.backups.enabled
                                          ? 'Scheduled'
                                          : 'Never'
                                        : e.backups.last_successful;

                                    return {
                                      ...e,
                                      lastBackup,
                                      maintenance,
                                      linodeDescription: getLinodeDescription(
                                        e.label,
                                        e.specs.memory,
                                        e.specs.disk,
                                        e.specs.vcpus,
                                        '',
                                        {}
                                      ),
                                    };
                                  })}
                                  headers={
                                    this.props
                                      .someLinodesHaveScheduledMaintenance
                                      ? [
                                          ...headers,
                                          /** only add maintenance window to CSV if one Linode has a window */
                                          {
                                            label: 'Maintenance Status',
                                            key: 'maintenance.when',
                                          },
                                        ]
                                      : headers
                                  }
                                  filename={`linodes-${formatDate(
                                    DateTime.local().toISO()
                                  )}.csv`}
                                  className={classes.CSVlink}
                                >
                                  Download CSV
                                </CSVLink>
                              </Grid>
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
          </Grid>
        </Grid>
        {!!this.state.selectedLinodeID && !!this.state.selectedLinodeLabel && (
          <React.Fragment>
            <PowerDialogOrDrawer
              isOpen={this.state.powerDialogOpen}
              action={this.state.powerDialogAction}
              linodeID={this.state.selectedLinodeID}
              linodeLabel={this.state.selectedLinodeLabel}
              close={this.closeDialogs}
              linodeConfigs={this.state.selectedLinodeConfigs}
            />
            <DeleteDialog
              open={this.state.deleteDialogOpen}
              onClose={this.closeDialogs}
              linodeID={this.state.selectedLinodeID}
              linodeLabel={this.state.selectedLinodeLabel}
              handleDelete={this.props.deleteLinode}
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
  linodesInTransition: Set<number>;
}

const mapStateToProps: MapState<StateProps, Props> = (state) => {
  return {
    linodesCount: state.__resources.linodes.results,
    linodesInTransition: _linodesInTransition(state.events.events),
  };
};

interface DispatchProps {
  deleteLinode: (linodeId: number) => Promise<Record<string, never>>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  deleteLinode: (linodeId: number) => dispatch(deleteLinode({ linodeId })),
});

const connected = connect(mapStateToProps, mapDispatchToProps);

const updateParams = (params: string, updater: (s: any) => any) => {
  const paramsAsObject = parse(params, { ignoreQueryPrefix: true });
  return stringify(updater(paramsAsObject));
};

export const enhanced = compose<CombinedProps, Props>(
  withRouter,
  setDocs(ListLinodes.docs),
  withSnackbar,
  connected,
  withImages(),
  styled,
  withFeatureFlagConsumer
);

export default enhanced(ListLinodes);

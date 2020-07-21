import { Config, LinodeStatus } from '@linode/api-v4/lib/linodes/types';
import { APIError } from '@linode/api-v4/lib/types';
import Close from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import * as classNames from 'classnames';
import { DateTime } from 'luxon';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { parse, stringify } from 'qs';
import { path } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import TableView from 'src/assets/icons/table-view.svg';
import AddNewLink from 'src/components/AddNewLink';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import Chip from 'src/components/core/Chip';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Hidden from 'src/components/core/Hidden';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import CSVLink from 'src/components/DownloadCSV';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import IconTextLink from 'src/components/IconTextLink';
import LandingHeader from 'src/components/LandingHeader';
import MaintenanceBanner from 'src/components/MaintenanceBanner';
import OrderBy from 'src/components/OrderBy';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import Toggle from 'src/components/Toggle';
import withBackupCta, {
  BackupCTAProps
} from 'src/containers/withBackupCTA.container';
import withFeatureFlagConsumer, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container';
import withImages, { WithImages } from 'src/containers/withImages.container';
import { LinodeGettingStarted, SecuringYourServer } from 'src/documentation';
import { BackupsCTA } from 'src/features/Backups';
import { ApplicationState } from 'src/store';
import { deleteLinode } from 'src/store/linodes/linode.requests';
import {
  addNotificationsToLinodes,
  LinodeWithMaintenance
} from 'src/store/linodes/linodes.helpers';
import { MapState } from 'src/store/types';
import formatDate, { formatDateISO } from 'src/utilities/formatDate';
import {
  sendGroupByTagEnabledEvent,
  sendLinodesViewEvent
} from 'src/utilities/ga';
import getLinodeDescription from 'src/utilities/getLinodeDescription';
import { BackupsCtaDismissed } from 'src/utilities/storage';
import LinodeResize_CMR from '../LinodesDetail/LinodeResize/LinodeResize_CMR';
import PowerDialogOrDrawer, { Action } from '../PowerActionsDialogOrDrawer';
import { linodesInTransition as _linodesInTransition } from '../transitions';
import CardView from './CardView';
import DeleteDialog from './DeleteDialog';
import DisplayGroupedLinodes from './DisplayGroupedLinodes';
import DisplayLinodes from './DisplayLinodes';
import styled, { StyleProps } from './LinodesLanding.styles';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import ListView from './ListView';
import ToggleBox from './ToggleBox';
import { ExtendedStatus, statusToPriority } from './utils';

type FilterStatus = 'running' | 'busy' | 'offline' | 'all';

interface State {
  powerDialogOpen: boolean;
  powerDialogAction?: Action;
  selectedLinodeConfigs?: Config[];
  selectedLinodeID?: number;
  selectedLinodeLabel?: string;
  deleteDialogOpen: boolean;
  groupByTag: boolean;
  CtaDismissed: boolean;
  linodeResizeOpen: boolean;
  filterStatus: FilterStatus;
}

interface Params {
  view?: string;
  groupByTag?: 'true' | 'false';
}

type RouteProps = RouteComponentProps<Params>;

type CombinedProps = WithImages &
  StateProps &
  DispatchProps &
  RouteProps &
  StyleProps &
  SetDocsProps &
  WithSnackbarProps &
  BackupCTAProps &
  FeatureFlagConsumerProps;

export class ListLinodes extends React.Component<CombinedProps, State> {
  state: State = {
    powerDialogOpen: false,
    deleteDialogOpen: false,
    groupByTag: false,
    CtaDismissed: BackupsCtaDismissed.get(),
    linodeResizeOpen: false,
    filterStatus: 'all'
  };

  static docs = [LinodeGettingStarted, SecuringYourServer];

  /**
   * when you change the linode view, instantly update the query params
   */
  changeViewInstant = (style: 'grid' | 'list') => {
    const { history, location } = this.props;

    const updatedParams = updateParams<Params>(location.search, params => ({
      ...params,
      view: style
    }));

    history.push(`?${updatedParams}`);
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
      selectedLinodeLabel: linodeLabel
    });
  };

  closeDialogs = () => {
    this.setState({
      powerDialogOpen: false,
      deleteDialogOpen: false
    });
  };

  openDeleteDialog = (linodeID: number, linodeLabel: string) => {
    this.setState({
      deleteDialogOpen: true,
      selectedLinodeID: linodeID,
      selectedLinodeLabel: linodeLabel
    });
  };

  dismissCTA = () => {
    this.setState({
      CtaDismissed: true
    });
    BackupsCtaDismissed.set('true');
  };

  openLinodeResize = (linodeID: number) => {
    this.setState({
      linodeResizeOpen: true,
      selectedLinodeID: linodeID
    });
  };

  closeLinodeResize = () => {
    this.setState({
      linodeResizeOpen: false
    });
  };

  setFilterStatus = (status: FilterStatus) => {
    this.setState({ filterStatus: status });
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
      backupsCTA,
      location,
      linodesInTransition
    } = this.props;

    const { filterStatus } = this.state;

    const params: Params = parse(this.props.location.search, {
      ignoreQueryPrefix: true
    });

    const filteredLinodes = filterLinodesByStatus(filterStatus, linodesData);

    const componentProps = {
      count: linodesCount,
      someLinodesHaveMaintenance: this.props
        .someLinodesHaveScheduledMaintenance,
      openPowerActionDialog: this.openPowerDialog,
      openDeleteDialog: this.openDeleteDialog,
      openLinodeResize: this.openLinodeResize
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
      { label: 'Most Recent Backup', key: 'backups.last_successful' },
      { label: 'Tags', key: 'tags' }
    ];

    const linodesRunningCount = filterLinodesByStatus('running', linodesData)
      .length;

    const linodesBusyCount = filterLinodesByStatus('busy', linodesData).length;

    const linodesOfflineCount = filterLinodesByStatus('offline', linodesData)
      .length;

    const chipProps = {
      component: 'button',
      clickable: true
    };

    return (
      <React.Fragment>
        {this.props.flags.cmr && (
          <LinodeResize_CMR
            open={this.state.linodeResizeOpen}
            onClose={this.closeLinodeResize}
            linodeId={this.state.selectedLinodeID}
            linodeLabel={
              this.props.linodesData.find(
                thisLinode => thisLinode.id === this.state.selectedLinodeID
              )?.label ?? undefined
            }
          />
        )}
        {this.props.someLinodesHaveScheduledMaintenance && (
          <MaintenanceBanner
            userTimezone={this.props.userTimezone}
            userTimezoneError={this.props.userTimezoneError}
            userTimezoneLoading={this.props.userTimezoneLoading}
          />
        )}
        <Grid container>
          <Grid
            item
            className={`${
              backupsCTA && !BackupsCtaDismissed.get() ? 'mlMain' : ''
            }`}
            xs={!backupsCTA || (backupsCTA && BackupsCtaDismissed.get() && 12)}
          >
            <DocumentTitleSegment segment="Linodes" />
            <PreferenceToggle<boolean>
              localStorageKey="GROUP_LINODES"
              preferenceOptions={[false, true]}
              preferenceKey="linodes_group_by_tag"
              toggleCallbackFnDebounced={sendGroupByAnalytic}
              value={
                // If some Linodes need maintenance, default to NOT grouping by tag.
                // This is because the "Group by Tag" view can reduce visibility of Linodes needing
                // maintenance, since the ordering of groups is alphanumeric and can't be changed.
                this.props.someLinodesHaveScheduledMaintenance
                  ? false
                  : undefined
              }
            >
              {({
                preference: linodesAreGrouped,
                togglePreference: toggleGroupLinodes
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
                      togglePreference: toggleLinodeView
                    }: ToggleProps<'list' | 'grid'>) => {
                      return (
                        <React.Fragment>
                          {this.props.flags.cmr ? (
                            <React.Fragment>
                              <Grid item xs={12}>
                                <LandingHeader
                                  title="Linodes"
                                  entity="Linode"
                                  onAddNew={() =>
                                    this.props.history.push('/linodes/create')
                                  }
                                  iconType="linode"
                                  docsLink="https://www.linode.com/docs/platform/billing-and-support/linode-beginners-guide/"
                                  body={
                                    <>
                                      <Chip
                                        className={classNames({
                                          [classes.chip]: true,
                                          [classes.chipRunning]: true,
                                          [classes.chipActive]:
                                            filterStatus === 'running'
                                        })}
                                        label={`${linodesRunningCount} RUNNING`}
                                        onClick={() =>
                                          this.setFilterStatus('running')
                                        }
                                        {...chipProps}
                                      />
                                      <Chip
                                        className={classNames({
                                          [classes.chip]: true,
                                          [classes.chipPending]: true,
                                          [classes.chipActive]:
                                            filterStatus === 'busy'
                                        })}
                                        onClick={() =>
                                          this.setFilterStatus('busy')
                                        }
                                        label={`${linodesBusyCount} BUSY`}
                                        {...chipProps}
                                      />
                                      <Chip
                                        className={classNames({
                                          [classes.chip]: true,
                                          [classes.chipOffline]: true,
                                          [classes.chipActive]:
                                            filterStatus === 'offline'
                                        })}
                                        onClick={() =>
                                          this.setFilterStatus('offline')
                                        }
                                        label={`${linodesOfflineCount} OFFLINE`}
                                        {...chipProps}
                                      />
                                      {filterStatus !== 'all' && (
                                        <IconTextLink
                                          SideIcon={Close}
                                          text="CLEAR FILTERS"
                                          title="CLEAR FILTERS"
                                          className={`${classes.clearFilters}`}
                                          onClick={() =>
                                            this.setFilterStatus('all')
                                          }
                                        />
                                      )}
                                    </>
                                  }
                                />
                              </Grid>
                              <Hidden xsDown>
                                {params.view === 'grid' && (
                                  <Grid item xs={12} className={'px0'}>
                                    <div className={classes.controlHeader}>
                                      <div
                                        id="displayViewDescription"
                                        className="visually-hidden"
                                      >
                                        Currently in {linodeViewPreference} view
                                      </div>
                                      <IconButton
                                        aria-label="Toggle display"
                                        aria-describedby={
                                          'displayViewDescription'
                                        }
                                        title={`Toggle display`}
                                        onClick={toggleLinodeView}
                                        disableRipple
                                        className={classes.toggleButton}
                                      >
                                        <TableView />
                                      </IconButton>

                                      <div
                                        id="groupByDescription"
                                        className="visually-hidden"
                                      >
                                        {linodesAreGrouped
                                          ? 'group by tag is currently enabled'
                                          : 'group by tag is currently disabled'}
                                      </div>
                                      <IconButton
                                        aria-label={`Toggle group by tag`}
                                        aria-describedby={'groupByDescription'}
                                        title={`Toggle group by tag`}
                                        onClick={toggleGroupLinodes}
                                        disableRipple
                                        className={classes.toggleButton}
                                      >
                                        <GroupByTag />
                                      </IconButton>
                                    </div>
                                  </Grid>
                                )}
                              </Hidden>
                            </React.Fragment>
                          ) : (
                            <Grid
                              container
                              alignItems="center"
                              justify="space-between"
                              item
                              xs={12}
                              style={{ paddingBottom: 0 }}
                            >
                              <Grid item className={classes.title}>
                                <Breadcrumb
                                  pathname={location.pathname}
                                  data-qa-title
                                  labelTitle="Linodes"
                                  className={classes.title}
                                />
                              </Grid>

                              <Hidden xsDown>
                                <FormControlLabel
                                  className={classes.tagGroup}
                                  control={
                                    <Toggle
                                      className={
                                        linodesAreGrouped
                                          ? ' checked'
                                          : ' unchecked'
                                      }
                                      onChange={toggleGroupLinodes}
                                      checked={linodesAreGrouped as boolean}
                                    />
                                  }
                                  label="Group by Tag:"
                                />
                                <ToggleBox
                                  handleClick={toggleLinodeView}
                                  status={linodeViewPreference}
                                />
                              </Hidden>

                              <AddNewLink
                                onClick={_ => {
                                  this.props.history.push('/linodes/create');
                                }}
                                label="Add a Linode"
                                className={classes.addNewLink}
                              />
                            </Grid>
                          )}
                          <Grid item xs={12}>
                            <OrderBy
                              data={filteredLinodes.map(linode => {
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
                                  _statusPriority: statusToPriority(_status)
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
                                orderBy
                              }) => {
                                const finalProps = {
                                  ...componentProps,
                                  data,
                                  handleOrderChange,
                                  order,
                                  orderBy
                                };

                                return linodesAreGrouped ? (
                                  <DisplayGroupedLinodes
                                    {...finalProps}
                                    display={linodeViewPreference}
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
                                    component={
                                      linodeViewPreference === 'grid'
                                        ? CardView
                                        : ListView
                                    }
                                  />
                                );
                              }}
                            </OrderBy>
                            <Grid container justify="flex-end">
                              <Grid item className={classes.CSVlinkContainer}>
                                <CSVLink
                                  data={linodesData.map(e => {
                                    const maintenance = e.maintenance?.when
                                      ? {
                                          ...e.maintenance,
                                          when: formatDateISO(
                                            e.maintenance?.when
                                          )
                                        }
                                      : { when: null };

                                    return {
                                      ...e,
                                      maintenance,
                                      linodeDescription: getLinodeDescription(
                                        e.label,
                                        e.specs.memory,
                                        e.specs.disk,
                                        e.specs.vcpus,
                                        '',
                                        {}
                                      )
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
                                            key: 'maintenance.when'
                                          }
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
        {backupsCTA && !BackupsCtaDismissed.get() && (
          <Grid item className="mlSidebar py0">
            <BackupsCTA dismissed={this.dismissCTA} />
          </Grid>
        )}
      </React.Fragment>
    );
  }
}

const filterLinodesByStatus = (
  status: FilterStatus,
  linodes: LinodeWithMaintenance[]
) => {
  if (status === 'all') {
    return linodes;
  }
  return linodes.filter(thisLinode => {
    const displayStatus = mapLinodeStatus(thisLinode.status);
    return displayStatus === status;
  });
};

const mapLinodeStatus = (linodeStatus: LinodeStatus) => {
  switch (linodeStatus) {
    case 'offline':
    case 'stopped':
      return 'offline';
    case 'running':
      return 'running';
    default:
      return 'busy';
  }
};

const eventCategory = 'linodes landing';

const sendGroupByAnalytic = (value: boolean) => {
  sendGroupByTagEnabledEvent(eventCategory, value);
};

interface StateProps {
  managed: boolean;
  linodesCount: number;
  linodesData: LinodeWithMaintenance[];
  linodesRequestError?: APIError[];
  linodesRequestLoading: boolean;
  userTimezone: string;
  userTimezoneLoading: boolean;
  userTimezoneError?: APIError[];
  someLinodesHaveScheduledMaintenance: boolean;
  linodesInTransition: Set<number>;
}

const mapStateToProps: MapState<StateProps, {}> = state => {
  const linodes = Object.values(state.__resources.linodes.itemsById);
  const notifications = state.__resources.notifications.data || [];

  const linodesWithMaintenance = addNotificationsToLinodes(
    notifications,
    linodes
  );

  return {
    managed: state.__resources.accountSettings.data?.managed ?? false,
    linodesCount: state.__resources.linodes.results,
    linodesData: linodesWithMaintenance,
    someLinodesHaveScheduledMaintenance: linodesWithMaintenance
      ? linodesWithMaintenance.some(
          eachLinode =>
            !!eachLinode.maintenance && !!eachLinode.maintenance.when
        )
      : false,
    linodesRequestLoading: state.__resources.linodes.loading,
    linodesRequestError: path(['error', 'read'], state.__resources.linodes),
    userTimezone: state.__resources.profile.data?.timezone ?? '',
    userTimezoneLoading: state.__resources.profile.loading,
    userTimezoneError: path<APIError[]>(
      ['read'],
      state.__resources.profile.error
    ),
    linodesInTransition: _linodesInTransition(state.events.events)
  };
};

interface DispatchProps {
  deleteLinode: (linodeId: number) => Promise<{}>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  deleteLinode: (linodeId: number) => dispatch(deleteLinode({ linodeId }))
});

const connected = connect(mapStateToProps, mapDispatchToProps);

const updateParams = <T extends any>(params: string, updater: (s: T) => T) => {
  const paramsAsObject: T = parse(params, { ignoreQueryPrefix: true });
  return stringify(updater(paramsAsObject));
};

export const enhanced = compose<CombinedProps, {}>(
  withRouter,
  setDocs(ListLinodes.docs),
  withSnackbar,
  connected,
  withImages(),
  withBackupCta,
  styled,
  withFeatureFlagConsumer
);

export default enhanced(ListLinodes);

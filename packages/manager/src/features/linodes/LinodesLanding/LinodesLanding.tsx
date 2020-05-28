import { Config } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import * as moment from 'moment-timezone';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { parse, stringify } from 'qs';
import { path } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import AddNewLink from 'src/components/AddNewLink';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Hidden from 'src/components/core/Hidden';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Toggle from 'src/components/Toggle';
import withBackupCta, {
  BackupCTAProps
} from 'src/containers/withBackupCTA.container';
import withImages, { WithImages } from 'src/containers/withImages.container';
import { LinodeGettingStarted, SecuringYourServer } from 'src/documentation';
import { BackupsCTA } from 'src/features/Backups';
import { ApplicationState } from 'src/store';
import { deleteLinode } from 'src/store/linodes/linode.requests';
import { MapState } from 'src/store/types';
import formatDate from 'src/utilities/formatDate';
import { formatNotifications } from 'src/utilities/formatNotifications';
import {
  sendGroupByTagEnabledEvent,
  sendLinodesViewEvent
} from 'src/utilities/ga';
import getLinodeDescription from 'src/utilities/getLinodeDescription';
import { BackupsCtaDismissed } from 'src/utilities/storage';
import CardView from './CardView';
import DisplayGroupedLinodes from './DisplayGroupedLinodes';
import DisplayLinodes from './DisplayLinodes';
import styled, { StyleProps } from './LinodesLanding.styles';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import ListView from './ListView';
import ToggleBox from './ToggleBox';

import MaintenanceBanner from 'src/components/MaintenanceBanner';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import {
  addNotificationsToLinodes,
  LinodeWithMaintenance
} from 'src/store/linodes/linodes.helpers';

import PowerDialogOrDrawer, { Action } from '../PowerActionsDialogOrDrawer';
import DeleteDialog from './DeleteDialog';

import CSVLink from 'src/components/DownloadCSV';

interface State {
  powerDialogOpen: boolean;
  powerDialogAction?: Action;
  selectedLinodeConfigs?: Config[];
  selectedLinodeID?: number;
  selectedLinodeLabel?: string;
  deleteDialogOpen: boolean;
  groupByTag: boolean;
  CtaDismissed: boolean;
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
  BackupCTAProps;

export class ListLinodes extends React.Component<CombinedProps, State> {
  state: State = {
    powerDialogOpen: false,
    deleteDialogOpen: false,
    groupByTag: false,
    CtaDismissed: BackupsCtaDismissed.get()
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
      location
    } = this.props;

    const params: Params = parse(this.props.location.search, {
      ignoreQueryPrefix: true
    });

    const componentProps = {
      count: linodesCount,
      someLinodesHaveMaintenance: this.props
        .someLinodesHaveScheduledMaintenance,
      openPowerActionDialog: this.openPowerDialog,
      openDeleteDialog: this.openDeleteDialog
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

    return (
      <React.Fragment>
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
            <Grid container>
              <DocumentTitleSegment segment="Linodes" />
              <PreferenceToggle<boolean>
                localStorageKey="GROUP_LINODES"
                preferenceOptions={[false, true]}
                preferenceKey="linodes_group_by_tag"
                toggleCallbackFnDebounced={sendGroupByAnalytic}
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
                            <Grid item xs={12}>
                              <OrderBy
                                data={linodesData.map(linode => {
                                  return {
                                    ...linode,
                                    displayStatus: linode.maintenance
                                      ? 'maintenance'
                                      : linode.status
                                  };
                                })}
                                order={'asc'}
                                orderBy={'label'}
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
                                      return {
                                        ...e,
                                        maintenance: e.maintenance || {
                                          when: null
                                        },
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
                                      moment().format()
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
        </Grid>
      </React.Fragment>
    );
  }
}

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
}

const mapStateToProps: MapState<StateProps, {}> = state => {
  const linodes = Object.values(state.__resources.linodes.itemsById);
  const notifications = state.__resources.notifications.data || [];

  const linodesWithMaintenance = addNotificationsToLinodes(
    formatNotifications(notifications),
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
    )
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
  styled
);

export default enhanced(ListLinodes);

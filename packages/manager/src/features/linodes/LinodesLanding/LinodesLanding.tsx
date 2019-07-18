import * as moment from 'moment-timezone';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { parse, stringify } from 'qs';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { CSVLink } from 'react-csv';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Hidden from 'src/components/core/Hidden';
import withWidth, { WithWidth } from 'src/components/core/WithWidth';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Toggle from 'src/components/Toggle';
import withBackupCta, {
  BackupCTAProps
} from 'src/containers/withBackupCTA.container';
import withImages from 'src/containers/withImages.container';
import { LinodeGettingStarted, SecuringYourServer } from 'src/documentation';
import { BackupsCTA } from 'src/features/Backups';
import { ApplicationState } from 'src/store';
import { deleteLinode } from 'src/store/linodes/linode.requests';
import { MapState } from 'src/store/types';
import formatDate from 'src/utilities/formatDate';
import {
  sendGroupByTagEnabledEvent,
  sendLinodesViewEvent
} from 'src/utilities/ga';
import { storage, views } from 'src/utilities/storage';
import CardView from './CardView';
import DisplayGroupedLinodes from './DisplayGroupedLinodes';
import DisplayLinodes from './DisplayLinodes';
import styled, { StyleProps } from './LinodesLanding.styles';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import ListView from './ListView';
import ToggleBox from './ToggleBox';

import MaintenanceBanner from 'src/components/MaintenanceBanner';
import PreferenceToggle from 'src/components/PreferenceToggle';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';

import PowerDialogOrDrawer, { Action } from '../PowerActionsDialogOrDrawer';
import DeleteDialog from './DeleteDialog';

interface State {
  powerDialogOpen: boolean;
  powerDialogAction?: Action;
  selectedLinodeConfigs?: Linode.Config[];
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

type CombinedProps = WithImagesProps &
  WithWidth &
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
    CtaDismissed: storage.BackupsCtaDismissed.get()
  };

  static docs = [LinodeGettingStarted, SecuringYourServer];

  changeView = (style: 'grid' | 'list') => {
    const { history, location } = this.props;

    const updatedParams = updateParams<Params>(location.search, params => ({
      ...params,
      view: style
    }));

    history.push(`?${updatedParams}`);

    if (style === 'grid') {
      views.linode.set('grid');
    } else {
      views.linode.set('list');
    }

    sendLinodesViewEvent(eventCategory, style);
  };

  openPowerDialog = (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Linode.Config[]
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
    storage.BackupsCtaDismissed.set('true');
  };

  render() {
    const {
      imagesError,
      imagesLoading,
      linodesRequestError,
      linodesRequestLoading,
      linodesCount,
      linodesData,
      width,
      classes,
      backupsCTA,
      location
    } = this.props;

    const params: Params = parse(this.props.location.search, {
      ignoreQueryPrefix: true
    });

    const userSelectedDisplay = getUserSelectedDisplay(params.view);

    const display: 'grid' | 'list' = getDisplayType(
      width,
      linodesCount,
      userSelectedDisplay
    );

    const component = display === 'grid' ? CardView : ListView;

    const componentProps = {
      display,
      component,
      count: linodesCount,
      someLinodesHaveMaintenance: this.props
        .someLinodesHaveScheduledMaintenance,
      openPowerActionDialog: this.openPowerDialog,
      openDeleteDialog: this.openDeleteDialog
    };

    if (imagesError || linodesRequestError) {
      let errorText = pathOr(
        'Error loading linodes',
        [0, 'reason'],
        linodesRequestError
      );

      if (errorText.toLowerCase() === 'this linode has been suspended') {
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
      { label: 'Label', key: 'label' },
      { label: 'Linode ID', key: 'id' },
      { label: 'Image', key: 'image' },
      { label: 'Region', key: 'region' },
      { label: 'Created', key: 'created' },
      { label: 'Most Recent Backup', key: 'mostRecentBackup' },
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
              backupsCTA && !storage.BackupsCtaDismissed.get() ? 'mlMain' : ''
              }`}
            xs={
              !backupsCTA ||
              (backupsCTA && storage.BackupsCtaDismissed.get() && 12)
            }
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
                }) => {
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
                                  linodesAreGrouped ? ' checked' : ' unchecked'
                                }
                                onChange={toggleGroupLinodes}
                                checked={linodesAreGrouped as boolean}
                                data-qa-tags-toggle={linodesAreGrouped}
                              />
                            }
                            label="Group by Tag:"
                          />
                          <ToggleBox
                            handleClick={this.changeView}
                            status={display}
                          />
                        </Hidden>
                      </Grid>
                      <Grid item xs={12}>
                        <OrderBy
                          data={linodesData}
                          order={'asc'}
                          orderBy={'label'}
                        >
                          {({ data, handleOrderChange, order, orderBy }) => {
                            const finalProps = {
                              ...componentProps,
                              data,
                              handleOrderChange,
                              order,
                              orderBy
                            };

                            return linodesAreGrouped ? (
                              <DisplayGroupedLinodes {...finalProps} />
                            ) : (
                                <DisplayLinodes {...finalProps} />
                              );
                          }}
                        </OrderBy>
                        <Grid container justify="flex-end">
                          <Grid item className={classes.CSVlinkContainer}>
                            <CSVLink
                              data={linodesData}
                              headers={
                                this.props.someLinodesHaveScheduledMaintenance
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
          {backupsCTA && !storage.BackupsCtaDismissed.get() && (
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

const getUserSelectedDisplay = (
  value?: string
): undefined | 'grid' | 'list' => {
  /** Value comes from the URL */
  if (value) {
    return value === 'grid' ? 'grid' : 'list';
  }

  /* If local storage exists, set the view based on that */
  const localStorageValue = views.linode.get();
  if (localStorageValue !== null) {
    return localStorageValue;
  }

  return;
};

interface StateProps {
  managed: boolean;
  linodesCount: number;
  linodesData: LinodeWithMaintenance[];
  linodesRequestError?: Linode.ApiFieldError[];
  linodesRequestLoading: boolean;
  userTimezone: string;
  userTimezoneLoading: boolean;
  userTimezoneError?: Linode.ApiFieldError[];
  someLinodesHaveScheduledMaintenance: boolean;
}

const mapStateToProps: MapState<StateProps, {}> = (state, ownProps) => {
  const linodesData = state.__resources.linodes.entities;

  return {
    managed: pathOr(
      false,
      ['__resources', 'accountSettings', 'data', 'managed'],
      state
    ),
    linodesCount: state.__resources.linodes.results.length,
    linodesData,
    someLinodesHaveScheduledMaintenance: linodesData
      ? linodesData.some(
        eachLinode =>
          !!eachLinode.maintenance && !!eachLinode.maintenance.when
      )
      : false,
    linodesRequestLoading: state.__resources.linodes.loading,
    linodesRequestError: path(['error', 'read'], state.__resources.linodes),
    userTimezone: pathOr('', ['data', 'timezone'], state.__resources.profile),
    userTimezoneLoading: state.__resources.profile.loading,
    userTimezoneError: path<Linode.ApiFieldError[]>(
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

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

const updateParams = <T extends any>(params: string, updater: (s: T) => T) => {
  const paramsAsObject: T = parse(params, { ignoreQueryPrefix: true });
  return stringify(updater(paramsAsObject));
};

const getDisplayType = (
  width: string,
  linodesCount: number,
  userSelect?: 'grid' | 'list'
) => {
  /**
   * We force the use of grid view at xs viewports.
   */
  if (['xs'].includes(width)) {
    return 'grid';
  }

  /**
   * If the user has made a selection (via URL param or localStorage) then use that value.
   */
  if (userSelect) {
    return userSelect;
  }

  /**
   * Default to choosing based on the total number of Linodes.
   * Note: Don't use data.length, otherwise the last page of 100000 Linodes will
   * display as a grid (and people don't like it).
   */
  return linodesCount >= 3 ? 'list' : 'grid';
};

interface WithImagesProps {
  imagesLoading: boolean;
  imagesError?: Linode.ApiFieldError[];
}

export const enhanced = compose<CombinedProps, {}>(
  withRouter,
  setDocs(ListLinodes.docs),
  withSnackbar,
  withWidth(),
  connected,
  withImages((ownProps, imagesData, imagesLoading, imagesError) => ({
    ...ownProps,
    imagesLoading,
    imagesError
  })),
  withBackupCta,
  styled
);

export default enhanced(ListLinodes);

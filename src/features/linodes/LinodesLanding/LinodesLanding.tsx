import withWidth, { WithWidth } from '@material-ui/core/withWidth';
import * as moment from 'moment-timezone';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { parse, stringify } from 'qs';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { CSVLink } from 'react-csv';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose, withStateHandlers } from 'recompose';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Hidden from 'src/components/core/Hidden';
import Typography from 'src/components/core/Typography';
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
import LinodeConfigSelectionDrawer, {
  LinodeConfigSelectionDrawerCallback
} from 'src/features/LinodeConfigSelectionDrawer';
import { ApplicationState } from 'src/store';
import { deleteLinode } from 'src/store/linodes/linode.requests';
import { MapState } from 'src/store/types';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
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
import { powerOffLinode, rebootLinode } from './powerActions';
import ToggleBox from './ToggleBox';

import MaintenanceBanner from 'src/components/MaintenanceBanner';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';

interface ConfigDrawerState {
  open: boolean;
  configs: Linode.Config[];
  error?: string;
  selected?: number;
  action?: LinodeConfigSelectionDrawerCallback;
}

interface State {
  configDrawer: ConfigDrawerState;
  confirmationOpen: boolean;
  confirmationError?: string;
  confirmationLoading: boolean;
  actionOption: Linode.KebabAction;
  selectedLinodeId: number | null;
  selectedLinodeLabel: string;
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
  ToggleGroupByTagsProps &
  StateProps &
  DispatchProps &
  RouteProps &
  StyleProps &
  SetDocsProps &
  WithSnackbarProps &
  BackupCTAProps;

export class ListLinodes extends React.Component<CombinedProps, State> {
  static eventCategory = 'linodes landing';

  state: State = {
    configDrawer: {
      open: false,
      configs: [],
      error: undefined,
      selected: undefined,
      action: (id: number) => null
    },
    confirmationOpen: false,
    confirmationError: undefined,
    confirmationLoading: false,
    actionOption: null,
    selectedLinodeId: null,
    selectedLinodeLabel: '',
    groupByTag: false,
    CtaDismissed: storage.BackupsCtaDismissed.get()
  };

  static docs = [LinodeGettingStarted, SecuringYourServer];

  openConfigDrawer = (
    configs: Linode.Config[],
    action: LinodeConfigSelectionDrawerCallback
  ) => {
    this.setState({
      configDrawer: {
        open: true,
        configs,
        selected: configs[0].id,
        action
      }
    });
  };

  closeConfigDrawer = () => {
    this.setState({
      configDrawer: {
        open: false,
        configs: [],
        error: undefined,
        selected: undefined,
        action: (id: number) => null
      }
    });
  };

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

    sendLinodesViewEvent(ListLinodes.eventCategory, style);
  };

  selectConfig = (id: number) => {
    this.setState(prevState => ({
      configDrawer: {
        ...prevState.configDrawer,
        selected: id
      }
    }));
  };

  submitConfigChoice = () => {
    const { action, selected } = this.state.configDrawer;
    if (selected && action) {
      action(selected);
      this.closeConfigDrawer();
    }
  };

  toggleDialog = (
    actionOption: Linode.KebabAction,
    selectedLinodeId: number,
    selectedLinodeLabel: string
  ) => {
    this.setState({
      confirmationOpen: !this.state.confirmationOpen,
      confirmationError: undefined,
      selectedLinodeId,
      selectedLinodeLabel,
      actionOption
    });
  };

  deleteLinode = (linodeId: number) => {
    const _deleteLinode = this.props.deleteLinode;
    _deleteLinode(linodeId)
      .then(_ =>
        this.setState({
          confirmationOpen: false,
          confirmationLoading: false,
          confirmationError: undefined
        })
      )
      .catch(err =>
        this.setState({
          confirmationLoading: false,
          confirmationError: getErrorStringOrDefault(
            err,
            'There was an error deleting your Linode.'
          )
        })
      );
  };

  executeAction = () => {
    const { actionOption, selectedLinodeId, selectedLinodeLabel } = this.state;
    this.setState({ confirmationError: undefined, confirmationLoading: true });
    switch (actionOption) {
      case 'reboot':
        rebootLinode(
          this.openConfigDrawer,
          selectedLinodeId!,
          selectedLinodeLabel,
          this.props.enqueueSnackbar
        );
        this.setState({ confirmationOpen: false, confirmationLoading: false });
        break;
      case 'power_down':
        powerOffLinode(selectedLinodeId!, selectedLinodeLabel);
        this.setState({ confirmationOpen: false, confirmationLoading: false });
        break;
      case 'delete':
        this.deleteLinode(selectedLinodeId!);
        break;
      default:
        this.setState({ confirmationOpen: false });
        break;
    }
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
      groupByTags,
      width,
      classes,
      backupsCTA
    } = this.props;

    const {
      configDrawer,
      actionOption,
      confirmationError,
      confirmationOpen
    } = this.state;

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
      openConfigDrawer: this.openConfigDrawer,
      toggleConfirmation: this.toggleDialog,
      display,
      component,
      count: linodesCount,
      someLinodesHaveMaintenance: this.props.someLinodesHaveScheduledMaintenance
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
              <Grid
                container
                justify="space-between"
                item
                xs={12}
                style={{ paddingBottom: 0 }}
              >
                <Grid item className={classes.title}>
                  <Typography
                    variant="h1"
                    className={this.props.classes.title}
                    data-qa-title
                  >
                    Linodes
                  </Typography>
                </Grid>
                <Hidden xsDown>
                  <FormControlLabel
                    className={classes.tagGroup}
                    control={
                      <Toggle
                        className={
                          this.props.groupByTags ? ' checked' : ' unchecked'
                        }
                        onChange={this.props.toggleGroupByTag}
                        checked={this.props.groupByTags}
                        data-qa-tags-toggle={this.props.groupByTags}
                      />
                    }
                    label="Group by Tag:"
                  />
                  <ToggleBox handleClick={this.changeView} status={display} />
                </Hidden>
              </Grid>
              <Grid item xs={12}>
                <OrderBy data={linodesData} order={'asc'} orderBy={'label'}>
                  {({ data, handleOrderChange, order, orderBy }) => {
                    const finalProps = {
                      ...componentProps,
                      data,
                      handleOrderChange,
                      order,
                      orderBy
                    };

                    return groupByTags ? (
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
                      filename={`linodes-${formatDate(moment().format())}.csv`}
                      className={classes.CSVlink}
                    >
                      Download CSV
                    </CSVLink>
                  </Grid>
                </Grid>
              </Grid>
              <LinodeConfigSelectionDrawer
                configs={configDrawer.configs}
                onClose={this.closeConfigDrawer}
                onSubmit={this.submitConfigChoice}
                onChange={this.selectConfig}
                open={configDrawer.open}
                selected={String(configDrawer.selected)}
                error={configDrawer.error}
              />
              <ConfirmationDialog
                title={
                  actionOption === 'reboot'
                    ? `Reboot ${this.state.selectedLinodeLabel}?`
                    : actionOption === 'power_down'
                    ? `Power Off ${this.state.selectedLinodeLabel}?`
                    : `Delete ${this.state.selectedLinodeLabel}?`
                }
                actions={this.renderConfirmationActions}
                open={confirmationOpen}
                onClose={this.closePowerAlert}
                error={confirmationError}
              >
                <Typography>{getConfirmationMessage(actionOption)}</Typography>
              </ConfirmationDialog>
            </Grid>
          </Grid>
          {backupsCTA && !storage.BackupsCtaDismissed.get() && (
            <Grid item className="mlSidebar py0">
              <BackupsCTA dismissed={this.dismissCTA} />
            </Grid>
          )}
        </Grid>
      </React.Fragment>
    );
  }

  renderConfirmationActions = () => {
    const { actionOption, confirmationLoading } = this.state;
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          buttonType="cancel"
          onClick={this.closePowerAlert}
          data-qa-cancel-cancel
        >
          Cancel
        </Button>
        <Button
          buttonType="secondary"
          onClick={this.executeAction}
          data-qa-confirm-cancel
          loading={confirmationLoading}
          destructive={actionOption === 'delete'}
        >
          {actionOption === 'reboot'
            ? 'Reboot'
            : actionOption === 'power_down'
            ? 'Power Off'
            : 'Delete'}
        </Button>
      </ActionsPanel>
    );
  };

  closePowerAlert = () => this.setState({ confirmationOpen: false });
}

const getConfirmationMessage = (actionOption: Linode.KebabAction) => {
  switch (actionOption) {
    case 'reboot':
      return 'Are you sure you want to reboot your Linode?';
    case 'power_down':
      return 'Are you sure you want to power down your Linode?';
    case 'delete':
      return 'Are you sure you want to delete your Linode? This will result in permanent data loss.';
    default:
      return 'Are you sure?';
  }
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
    userTimezoneError: state.__resources.profile.error
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

interface ToggleGroupByTagsProps {
  groupByTags: boolean;
  toggleGroupByTag: (e: React.ChangeEvent<any>, checked: boolean) => void;
}

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

const toggleGroupState = withStateHandlers(
  (ownProps: RouteProps) => {
    const localStorageSelection = storage.views.grouped.get();
    return {
      groupByTags:
        localStorageSelection === undefined ? false : localStorageSelection
    };
  },
  {
    toggleGroupByTag: (state, ownProps) => (e, checked) => {
      storage.views.grouped.set(checked ? 'true' : 'false');

      sendGroupByTagEnabledEvent(ListLinodes.eventCategory, checked);

      return { ...state, groupByTags: checked };
    }
  }
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
  toggleGroupState,
  styled,
  setDocs(ListLinodes.docs),
  withSnackbar,
  withWidth(),
  connected,
  withImages((ownProps, imagesData, imagesLoading, imagesError) => ({
    ...ownProps,
    imagesLoading,
    imagesError
  })),
  withBackupCta
);

export default enhanced(ListLinodes);

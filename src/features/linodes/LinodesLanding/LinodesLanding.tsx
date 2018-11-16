import * as Bluebird from 'bluebird';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Hidden from 'src/components/core/Hidden';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import { LinodeGettingStarted, SecuringYourServer } from 'src/documentation';
import LinodeConfigSelectionDrawer, { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { getImages } from 'src/services/images';
import { getLinodes } from 'src/services/linodes';
import { requestLinodesWithoutBackups } from 'src/store/reducers/backupDrawer';
import { addBackupsToSidebar, clearSidebar } from 'src/store/reducers/sidebar';
import { views } from 'src/utilities/storage';
import LinodesViewWrapper from './LinodesViewWrapper';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import { powerOffLinode, rebootLinode } from './powerActions';
import requestMostRecentBackupForLinode from './requestMostRecentBackupForLinode';
import ToggleBox from './ToggleBox';
import withUpdatingLinodes from './withUpdatingLinodes';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    marginbottom: theme.spacing.unit * 2,
  },
});

interface ConfigDrawerState {
  open: boolean;
  configs: Linode.Config[];
  error?: string;
  selected?: number;
  action?: LinodeConfigSelectionDrawerCallback;
}

interface State {
  configDrawer: ConfigDrawerState;
  powerAlertOpen: boolean;
  bootOption: Linode.BootAction;
  selectedLinodeId: number | null;
  selectedLinodeLabel: string;
  images: {
    loading: boolean;
    data: Linode.Image[];
    error?: Error;
  },
}

interface TypesContextProps {
  typesRequest: () => void;
  typesLoading: boolean;
  typesLastUpdated: number;
}

type CombinedProps =
  TypesContextProps
  & PaginationProps<Linode.Linode>
  & StateProps
  & DispatchProps
  & RouteComponentProps<{}>
  & WithStyles<ClassNames>
  & SetDocsProps;

export class ListLinodes extends React.Component<CombinedProps, State> {
  mounted: boolean = false;

  state: State = {
    configDrawer: {
      open: false,
      configs: [],
      error: undefined,
      selected: undefined,
      action: (id: number) => null,
    },
    images: {
      loading: true,
      data: [],
    },
    powerAlertOpen: false,
    bootOption: null,
    selectedLinodeId: null,
    selectedLinodeLabel: '',
  };

  static docs = [
    LinodeGettingStarted,
    SecuringYourServer,
  ];

  getImages = () => {
    if (this.state.images.loading === false) {
      this.setState({ images: { ...this.state.images, loading: true } });
    }

    getImages()
      .then(response => this.setState({
        images: {
          ...this.state.images,
          loading: false,
          data: response.data,
        }
      }))
      .catch(response => this.setState({
        images: {
          ...this.state.images,
          loading: false,
          error: new Error('Unable to load image data.'),
        }
      }))
  }

  componentDidMount() {
    const { typesLastUpdated, typesLoading, typesRequest } = this.props;
    const { getLinodesWithoutBackups, setSidebar } = this.props.actions;

    this.mounted = true;

    /** Get the Linodes using the request handler provided by Pagey. */
    this.props.request();

    this.getImages();

    /** Check if the user has any Linodes without backups enabled
     * (This also pre-populates the Backups drawer with these Linodes)
     */

    getLinodesWithoutBackups();
    /* Set the BackupsCTA in the docs sidebar. It will only
    * render itself for customers who have backups in need of Linodes.
    */
    setSidebar();


    if (typesLastUpdated === 0 && !typesLoading) {
      typesRequest();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    this.props.actions.clearSidebar();
  }

  openConfigDrawer = (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => {
    this.setState({
      configDrawer: {
        open: true,
        configs,
        selected: configs[0].id,
        action,
      },
    });
  }

  closeConfigDrawer = () => {
    this.setState({
      configDrawer: {
        open: false,
        configs: [],
        error: undefined,
        selected: undefined,
        action: (id: number) => null,
      },
    });
  }

  changeViewStyle = (style: 'grid' | 'list') => {
    const { history } = this.props;
    history.push(`#${style}`);
    if (style === 'grid') {
      views.linode.set('grid');
    } else {
      views.linode.set('list');
    }
  }

  selectConfig = (id: number) => {
    this.setState(prevState => ({
      configDrawer: {
        ...prevState.configDrawer,
        selected: id,
      },
    }));
  }

  submitConfigChoice = () => {
    const { action, selected } = this.state.configDrawer;
    if (selected && action) {
      action(selected);
      this.closeConfigDrawer();
    }
  }

  toggleDialog = (
    bootOption: Linode.BootAction,
    selectedLinodeId: number,
    selectedLinodeLabel: string,
  ) => {
    this.setState({
      powerAlertOpen: !this.state.powerAlertOpen,
      selectedLinodeId,
      selectedLinodeLabel,
      bootOption,
    });
  }

  rebootOrPowerLinode = () => {
    const { bootOption, selectedLinodeId, selectedLinodeLabel } = this.state;
    if (bootOption === 'reboot') {
      rebootLinode(this.openConfigDrawer, selectedLinodeId!, selectedLinodeLabel);
    } else {
      powerOffLinode(selectedLinodeId!, selectedLinodeLabel);
    }
    this.setState({ powerAlertOpen: false });
  }

  renderContent = (linodes: Linode.Linode[], images: Linode.Image[], view: 'grid' | 'list') => {
    return (
      <LinodesViewWrapper
        view={view}
        linodes={linodes}
        images={images}
        openConfigDrawer={this.openConfigDrawer}
        toggleConfirmation={this.toggleDialog}
      />
    )
  }

  render() {
    const {
      location: { hash },
      count,
      data: linodes,
      error: linodesError,
      loading: linodesLoading,
    } = this.props;

    const {
      configDrawer,
      bootOption,
      powerAlertOpen,
      images: {
        error: imagesError,
        loading: imagesLoading,
        data: imagesData,
      },
    } = this.state;

    if (linodesLoading || imagesLoading) {
      return <CircleProgress />;
    }

    if (linodes.length === 0) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Linodes" />
          <ListLinodesEmptyState />
        </React.Fragment>
      );
    }

    if (linodesError) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Linodes" />
          <ErrorState errorText="Error loading data" />
        </React.Fragment>
      );
    }

    if (imagesError) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Linodes" />
          <ErrorState errorText="Error loading data" />
        </React.Fragment>
      );
    }

    const displayGrid: 'grid' | 'list' = getDisplayFormat({ hash, length: count });

    return (
      <Grid container>
        <DocumentTitleSegment segment="Linodes" />
        <Grid item xs={12}>
          <Typography
            role="header"
            variant="headline"
            className={this.props.classes.title}
            data-qa-title
          >
            Linodes
          </Typography>
          <Hidden smDown>
            <ToggleBox
              handleClick={this.changeViewStyle}
              status={displayGrid}
            />
          </Hidden>
        </Grid>
        <Grid item xs={12}>
          <Hidden mdUp>
            {this.renderContent(linodes, imagesData, 'grid')}
          </Hidden>
          <Hidden smDown>
            {displayGrid === 'grid'
              ? this.renderContent(linodes, imagesData, 'grid')
              : this.renderContent(linodes, imagesData, 'list')
            }
          </Hidden>
        </Grid>
        <Grid item xs={12}>
          {
            <PaginationFooter
              count={this.props.count}
              handlePageChange={this.props.handlePageChange}
              handleSizeChange={this.props.handlePageSizeChange}
              pageSize={this.props.pageSize}
              page={this.props.page}
            />
          }
          <LinodeConfigSelectionDrawer
            onClose={this.closeConfigDrawer}
            onSubmit={this.submitConfigChoice}
            onChange={this.selectConfig}
            open={configDrawer.open}
            configs={configDrawer.configs}
            selected={String(configDrawer.selected)}
            error={configDrawer.error}
          />
        </Grid>
        <ConfirmationDialog
          title={(bootOption === 'reboot') ? 'Confirm Reboot' : 'Powering Off'}
          actions={this.renderConfirmationActions}
          open={powerAlertOpen}
          onClose={this.closePowerAlert}
        >
          <Typography>
            {bootOption === 'reboot'
              ? 'Are you sure you want to reboot your Linode'
              : 'Are you sure you want to power down your Linode'
            }
          </Typography>
        </ConfirmationDialog>
      </Grid>
    );
  }

  renderConfirmationActions = () => {
    const { bootOption } = this.state;
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          type="cancel"
          onClick={this.closePowerAlert}
          data-qa-cancel-cancel
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={this.rebootOrPowerLinode}
          data-qa-confirm-cancel
        >
          {bootOption === 'reboot' ? 'Reboot' : 'Power Off'}
        </Button>
      </ActionsPanel>
    );
  };

  closePowerAlert = () => this.setState({ powerAlertOpen: false });
}

const getDisplayFormat = ({ hash, length }: { hash?: string, length: number }): 'grid' | 'list' => {

  if (hash) {
    return hash === '#grid' ? 'grid' : 'list';
  }

  /*
  * If local storage exists, set the view based on that
  */
  if (views.linode.get() !== null) {
    return views.linode.get();
  }

  return (length >= 3) ? 'list' : 'grid';
};

export const styled = withStyles(styles, { withTheme: true });

interface LinodeWithNotifications extends Linode.Linode {
  notifications?: Linode.Notification[];
}

interface StateProps {
  data: LinodeWithNotifications[];
  linodesWithoutBackups: Linode.Linode[];
  managed: boolean;
}

interface DispatchProps {
  actions: {
    getLinodesWithoutBackups: () => void;
    clearSidebar: () => void;
    setSidebar: () => void;
  }
}

/**
 * 'linodes' are provided by pagination and 'notifications' are provided by redux. We're using MSTP
 * to join the Notifications to the appropriate Linode and provide that to the component.
 */
let mapStateToProps: MapStateToProps<StateProps, PaginationProps<Linode.Linode>, ApplicationState>;
mapStateToProps = (state, ownProps) => {
  const notifications = state.notifications.data || [];
  const linodes = (ownProps.data || []);

  return {
    data: linodes.map(addNotificationToLinode(notifications)),
    linodesWithoutBackups: pathOr([], ['backups', 'data'], state),
    managed: pathOr(false, ['__resources', 'accountSettings', 'data', 'managed'], state)
  }
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch, ownProps) => {
  return {
    actions: {
      getLinodesWithoutBackups: () => dispatch(requestLinodesWithoutBackups()),
      clearSidebar: () => dispatch(clearSidebar()),
      setSidebar: () => dispatch(addBackupsToSidebar())
    }
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

const paginated = Pagey((ownProps, params, filters) =>
  getLinodes(params, filters)
    .then((response) => {

      return Bluebird.map(response.data, requestMostRecentBackupForLinode)
        .then(linodes => ({ ...response, data: linodes }));
    })
);

const data = compose(
  paginated,
  connected,
  withUpdatingLinodes,
);

export const enhanced = compose(
  withRouter,
  styled,
  setDocs(ListLinodes.docs),
  data,
);

const getNotificationMessageByEntityId = (id: number, notifications: Linode.Notification[]): undefined | string => {
  const found = notifications.find((n) => n.entity !== null && n.entity.id === id);
  return found ? found.message : undefined;
}

const addNotificationToLinode = (notifications: Linode.Notification[]) => (linode: Linode.Linode) => ({
  ...linode,
  notification: getNotificationMessageByEntityId(linode.id, notifications)
});

export default enhanced(ListLinodes) as typeof ListLinodes;

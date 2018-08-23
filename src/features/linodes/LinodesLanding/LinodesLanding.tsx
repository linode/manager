import * as moment from 'moment';
import { clone, compose, defaultTo, lensPath, map, over, path, pathEq, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import Hidden from '@material-ui/core/Hidden';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import PaginationFooter from 'src/components/PaginationFooter';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import { withTypes } from 'src/context/types';
import { events$ } from 'src/events';
import LinodeConfigSelectionDrawer, { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { newLinodeEvents } from 'src/features/linodes/events';
import notifications$ from 'src/notifications';
import { getImages } from 'src/services/images';
import { getLinode, getLinodes } from 'src/services/linodes';
import scrollToTop from 'src/utilities/scrollToTop';

import LinodesGridView from './LinodesGridView';
import LinodesListView from './LinodesListView';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import { powerOffLinode, rebootLinode } from './powerActions';
import ToggleBox from './ToggleBox';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginbottom: theme.spacing.unit * 2,
  },
});

interface Props { }

interface PreloadedProps {
  linodes: PromiseLoaderResponse<Linode.ResourcePage<Linode.EnhancedLinode>>;
  images: PromiseLoaderResponse<Linode.ResourcePage<Linode.Image>>;
}

interface ConfigDrawerState {
  open: boolean;
  configs: Linode.Config[];
  error?: string;
  selected?: number;
  action?: LinodeConfigSelectionDrawerCallback;
}

interface State {
  linodes: Linode.EnhancedLinode[];
  notifications?: Linode.Notification[];
  page: number;
  pages: number;
  results: number;
  pageSize: number;
  configDrawer: ConfigDrawerState;
  powerAlertOpen: boolean;
  bootOption: Linode.BootAction;
  selectedLinodeId: number | null;
  selectedLinodeLabel: string;
}

const preloaded = PromiseLoader<Props>({
  linodes: () => getLinodes({ page_size: 25 }),

  images: () => getImages(),
});

interface TypesContextProps {
  typesRequest: () => void;
  typesLoading: boolean;
  typesLastUpdated: number;
}

type CombinedProps = Props
  & TypesContextProps
  & PreloadedProps
  & RouteComponentProps<{}>
  & WithStyles<ClassNames>
  & SetDocsProps;

const L = {
  response: {
    data: lensPath(['response', 'data']),
  }
};

export class ListLinodes extends React.Component<CombinedProps, State> {
  eventsSub: Subscription;
  notificationSub: Subscription;
  mounted: boolean = false;

  state: State = {
    linodes: pathOr([], ['response', 'data'], this.props.linodes),
    page: pathOr(-1, ['response', 'page'], this.props.linodes),
    pages: pathOr(-1, ['response', 'pages'], this.props.linodes),
    results: pathOr(0, ['response', 'results'], this.props.linodes),
    configDrawer: {
      open: false,
      configs: [],
      error: undefined,
      selected: undefined,
      action: (id: number) => null,
    },
    pageSize: 25,
    powerAlertOpen: false,
    bootOption: null,
    selectedLinodeId: null,
    selectedLinodeLabel: '',
  };

  static docs = [
    {
      title: 'Getting Started with Linode',
      src: 'https://linode.com/docs/getting-started/',
      body: `Thank you for choosing Linode as your cloud hosting provider! This guide will help you
      sign up for an account, set up a Linux distribution, boot your Linode, and perform some basic
      system administr...`,
    },
    {
      title: 'How to Secure your Server',
      src: 'https://linode.com/docs/security/securing-your-server/',
      body: `Keeping your software up to date is the single biggest security precaution you can
      take for any operating system. Software updates range from critical vulnerability patches to
      minor bug fixes, and...`,
    },

  ];

  componentDidMount() {
    this.mounted = true;
    const mountTime = moment().subtract(5, 'seconds');

    const { typesLastUpdated, typesLoading, typesRequest } = this.props;

    if (typesLastUpdated === 0 && !typesLoading) {
      typesRequest();
    }

    this.eventsSub = events$
      .filter(newLinodeEvents(mountTime))
      .filter(e => !e._initial)
      .subscribe((linodeEvent) => {
        const linodeId = path<number>(['entity', 'id'], linodeEvent);
        if (!linodeId) { return; }

        getLinode(linodeId)
          .then(response => response.data)
          .then((linode) => {
            if (!this.mounted) { return; }

            return this.setState((prevState) => {
              const targetIndex = prevState.linodes.findIndex(
                _linode => _linode.id === (linodeEvent.entity as Linode.Entity).id);
              const updatedLinodes = clone(prevState.linodes);
              updatedLinodes[targetIndex] = linode;
              updatedLinodes[targetIndex].recentEvent = linodeEvent;
              return { linodes: updatedLinodes };
            });
          });
      });

    this.notificationSub = Observable
      .combineLatest(
        notifications$
          .map(notifications => notifications.filter(pathEq(['entity', 'type'], 'linode'))),
        Observable.of(this.props.linodes),
    )
      .map(([notifications, linodes]) => over(
        L.response.data,
        compose(
          map(addNotificationToLinode(notifications)),
          defaultTo([]),
        ),
        linodes,
      ))
      .subscribe((response) => {
        if (!this.mounted) { return; }

        return this.setState({ linodes: response.response.data });
      });
  }

  componentWillUnmount() {
    this.mounted = false;
    this.eventsSub.unsubscribe();
    this.notificationSub.unsubscribe();
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

  changeViewStyle = (style: string) => {
    const { history } = this.props;
    history.push(`#${style}`);
    localStorage.setItem('linodesViewStyle', style);
  }

  renderListView = (
    linodes: Linode.Linode[],
    images: Linode.Image[],
  ) => {
    return (
      <LinodesListView
        linodes={linodes}
        images={images}
        openConfigDrawer={this.openConfigDrawer}
        toggleConfirmation={this.toggleDialog}
      />
    );
  }

  renderGridView = (
    linodes: Linode.Linode[],
    images: Linode.Image[],
  ) => {
    return (
      <LinodesGridView
        linodes={linodes}
        images={images}
        openConfigDrawer={this.openConfigDrawer}
        toggleConfirmation={this.toggleDialog}
      />
    );
  }

  getLinodes = (page = 1, pageSize = 25) => {
    const lastPage = Math.ceil(this.state.results / pageSize);
    getLinodes({
      page: Math.min(lastPage, page),
      page_size: pageSize,
    })
      .then((response) => {
        if (!this.mounted) { return; }

        this.setState(prevResults => ({
          ...prevResults,
          linodes: pathOr([], ['data'], response),
          page: pathOr(0, ['page'], response),
          pageSize,
          pages: pathOr(0, ['pages'], response),
          results: pathOr(0, ['results'], response),
        }));
      });
  }

  handlePageSelection = (page: number) => {
    scrollToTop();
    this.getLinodes(Math.min(page), this.state.pageSize);
  }

  handlePageSizeChange = (pageSize: number) => {
    this.getLinodes(this.state.page, pageSize);
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

  toggleDialog = (bootOption: Linode.BootAction,
    selectedLinodeId: number, selectedLinodeLabel: string) => {
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

  render() {
    const { location: { hash } } = this.props;
    const { linodes, configDrawer, bootOption, powerAlertOpen, results } = this.state;
    const images = pathOr([], ['response', 'data'], this.props.images);

    if (linodes.length === 0) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Linodes" />
          <ListLinodesEmptyState />
        </React.Fragment>
      );
    }

    if (this.props.linodes.error) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Linodes" />
          <ErrorState errorText="Error loading data" />
        </React.Fragment>
      );
    }

    if (this.props.images.error) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Linodes" />
          <ErrorState errorText="Error loading data" />
        </React.Fragment>
      );
    }

    const displayGrid: 'grid' | 'list' = getDisplayFormat({ hash, length: results });

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
            {this.renderGridView(linodes, images)}
          </Hidden>
          <Hidden smDown>
            {displayGrid === 'grid'
              ? this.renderGridView(linodes, images)
              : this.renderListView(linodes, images)
            }
          </Hidden>
        </Grid>
        <Grid item xs={12}>
          {
            this.state.results > 25 &&
            <PaginationFooter
              count={this.state.results}
              handlePageChange={this.handlePageSelection}
              handleSizeChange={this.handlePageSizeChange}
              pageSize={this.state.pageSize}
              page={this.state.page}
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
        >
          {bootOption === 'reboot'
            ? 'Are you sure you want to reboot your Linode'
            : 'Are you sure you want to power down your Linode'}
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
          type="secondary"
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


const getNotificationMessageByEntityId = (id: number, notifications: Linode.Notification[]): undefined | string => {
  const found = notifications.find((n) => n.entity !== null && n.entity.id === id);
  return found ? found.message : undefined;
}

const addNotificationToLinode = (notifications: Linode.Notification[]) => (linode: Linode.Linode) => ({
  ...linode,
  notification: getNotificationMessageByEntityId(linode.id, notifications)
});

const getDisplayFormat = ({ hash, length }: { hash?: string, length: number }): 'grid' | 'list' => {
  const local = localStorage.getItem('linodesViewStyle');

  if (hash) {
    return hash === '#grid' ? 'grid' : 'list';
  }

  if (local) {
    return local as 'grid' | 'list';
  }

  return (length >= 3) ? 'list' : 'grid';
};

export const styled = withStyles(styles, { withTheme: true });

const typesContext = withTypes(({
  lastUpdated: typesLastUpdated,
  loading: typesLoading,
  request: typesRequest,
}) => ({
  typesRequest,
  typesLoading,
  typesLastUpdated,
}));

export const enhanced = compose(
  withRouter,
  typesContext,
  styled,
  preloaded,
  setDocs(ListLinodes.docs),
);

export default enhanced(ListLinodes) as typeof ListLinodes;

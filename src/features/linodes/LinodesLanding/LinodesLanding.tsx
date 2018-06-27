import * as React from 'react';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import * as moment from 'moment';
import {
  allPass,
  clone,
  compose,
  filter,
  gte,
  has,
  ifElse,
  isEmpty,
  pathEq,
  path,
  pathOr,
  prop,
  propEq,
  uniqBy,
} from 'ramda';
import { Observable, Subscription } from 'rxjs/Rx';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';

import { events$ } from 'src/events';
import { getImages } from 'src/services/images';
import { getLinodes, getLinode } from 'src/services/linodes';
import { newLinodeEvents } from 'src/features/linodes/events';
import ActionsPanel from 'src/components/ActionsPanel';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LinodeConfigSelectionDrawer, { LinodeConfigSelectionDrawerCallback }
  from 'src/features/LinodeConfigSelectionDrawer';
import notifications$ from 'src/notifications';
import PaginationFooter from 'src/components/PaginationFooter';
import ProductNotification from 'src/components/ProductNotification';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';

import { rebootLinode, powerOffLinode } from './powerActions';
import LinodesListView from './LinodesListView';
import LinodesGridView from './LinodesGridView';
import ListLinodesEmptyState from './ListLinodesEmptyState';
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

type CombinedProps = Props
  & PreloadedProps
  & RouteComponentProps<{}>
  & WithStyles<ClassNames>
  & SetDocsProps;

export class ListLinodes extends React.Component<CombinedProps, State> {
  eventsSub: Subscription;
  notificationSub: Subscription;
  notificationsSubscription: Subscription;
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
      .map(([notifications, linodes]) => {
        /** Imperative and gross a/f. Ill fix it. */
        linodes.response.data = linodes.response.data.map((linode) => {
          const notification = notifications.find(pathEq(['entity', 'id'], linode.id));
          if (notification) {
            linode.notification = notification.message;
            return linode;
          }

          return linode;
        });

        return linodes;
      })
      .subscribe((response) => {
        if (!this.mounted) { return; }

        return this.setState({ linodes: response.response.data });
      });

    this.notificationsSubscription = notifications$
      .map(compose(
        uniqBy(prop('type')),
        filter(allPass([
          pathEq(['entity', 'type'], 'linode'),
          has('message'),
        ])),
      ))
      .subscribe((notifications: Linode.Notification[]) =>
        this.setState({ notifications }));
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

  scrollToTop = () => {
    window.scroll({
      behavior: 'smooth',
      left: 0,
      top: 0,
    });
  }

  handlePageSelection = (page: number) => {
    this.scrollToTop();
    this.getLinodes(Math.min(page), this.state.pageSize);
  }

  handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.getLinodes(this.state.page, parseInt(event.target.value, 0));
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
    const { linodes, configDrawer, bootOption, powerAlertOpen } = this.state;
    const images = pathOr([], ['response', 'data'], this.props.images);

    if (linodes.length === 0) {
      return <ListLinodesEmptyState />;
    }

    if (this.props.linodes.error) {
      return (
        <ErrorState errorText="Error loading data" />
      );
    }

    if (this.props.images.error) {
      return (
        <ErrorState errorText="Error loading data" />
      );
    }

    const displayGrid: 'grid' | 'list' = getDisplayFormat({ hash, length: linodes.length });

    return (
      <Grid container>
        <Grid item xs={12}>
          <Typography
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
          {
            (this.state.notifications || []).map(n =>
              <ProductNotification key={n.type} severity={n.severity} text={n.message} />)
          }
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
              handlePageChange={this.handlePageSelection}
              handleSizeChange={this.handlePageSizeChange}
              pageSize={this.state.pageSize}
              pages={this.state.pages}
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
          actions={() =>
            <ActionsPanel style={{ padding: 0 }}>
              <Button
                variant="raised"
                color="secondary"
                className="destructive"
                onClick={this.rebootOrPowerLinode}
                data-qa-confirm-cancel
              >
                {(bootOption === 'reboot')
                  ? 'Reboot'
                  : 'Power Off'}
              </Button>
              <Button
                onClick={() => this.setState({ powerAlertOpen: false })}
                variant="raised"
                color="secondary"
                className="cancel"
                data-qa-cancel-cancel
              >
                Cancel
            </Button>
            </ActionsPanel>
          }
          open={powerAlertOpen}
        >
          {bootOption === 'reboot'
            ? 'Are you sure you want to reboot your Linode'
            : 'Are you sure you want to power down your Linode'}
        </ConfirmationDialog>
      </Grid>
    );
  }
}

const getDisplayFormat = ifElse(
  compose(isEmpty, prop('hash')),
  /* is empty */
  ifElse(
    compose(gte(3), prop('length')),
    () => 'grid',
    () => 'list',
  ),
  /* is not empty */
  ifElse(
    propEq('hash', '#grid'),
    () => 'grid',
    () => 'list',
  ),
);

export const styled = withStyles(styles, { withTheme: true });

export const enhanced = compose(
  withRouter,
  styled,
  preloaded,
  setDocs(ListLinodes.docs),
);

export default enhanced(ListLinodes) as typeof ListLinodes;

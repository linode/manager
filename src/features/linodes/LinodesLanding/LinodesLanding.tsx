import * as React from 'react';
import Axios, { AxiosResponse } from 'axios';
import * as moment from 'moment';
import {
  clone, pathOr, ifElse, compose, prop, propEq, isEmpty, gte,
} from 'ramda';
import { connect } from 'react-redux';
import { Observable, Subscription } from 'rxjs/Rx';
import Hidden from 'material-ui/Hidden';

import { API_ROOT } from 'src/constants';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import {
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';

import { events$ } from 'src/events';
import { newLinodeEvents } from 'src/features/linodes/events';
import ErrorState from 'src/components/ErrorState';
import WithDocumentation from 'src/components/WithDocumentation';
import PaginationFooter from 'src/components/PaginationFooter';

import LinodesListView from './LinodesListView';
import LinodesGridView from './LinodesGridView';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import ToggleBox from './ToggleBox';
import notifications$ from 'src/notifications';

import './linodes.css';
import LinodeConfigSelectionDrawer, {
  LinodeConfigSelectionDrawerCallback,
} from 'src/features/LinodeConfigSelectionDrawer';

interface Props { }

interface ConnectedProps {
  types: Linode.LinodeType[];
}

interface PreloadedProps {
  linodes: PromiseLoaderResponse<Linode.ManyResourceState<Linode.EnhancedLinode>>;
  images: PromiseLoaderResponse<Linode.ManyResourceState<Linode.Image>>;
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
  page: number;
  pages: number;
  results: number;
  pageSize: number;
  configDrawer: ConfigDrawerState;
}

const mapStateToProps = (state: Linode.AppState) => ({
  types: pathOr({}, ['resources', 'types', 'data', 'data'], state),
});

const preloaded = PromiseLoader<Props>({
  linodes: () => Axios.get(`${API_ROOT}/linode/instances`, { params: { page_size: 25 } })
    .then(response => response.data),

  images: () => Axios.get(`${API_ROOT}/images`)
    .then(response => response.data),
});

type CombinedProps = Props & ConnectedProps & PreloadedProps & RouteComponentProps<{}>;

class ListLinodes extends React.Component<CombinedProps, State> {
  eventsSub: Subscription;
  notificationSub: Subscription;

  state = {
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
  };

  /**
  * @todo Test docs for review.
  */
  docs = [
    {
      title: 'Lorem Ipsum Dolor',
      src: 'http://www.linode.com',
      body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
   Suspendisse dignissim porttitor turpis a elementum. Ut vulputate
   ex elit, quis sed.`,
    },
    {
      title: 'Lorem Ipsum Dolor',
      src: 'http://www.linode.com',
      body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
   Suspendisse dignissim porttitor turpis a elementum. Ut vulputate
   ex elit, quis sed.`,
    },
    {
      title: 'Lorem Ipsum Dolor',
      src: 'http://www.linode.com',
      body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
   Suspendisse dignissim porttitor turpis a elementum. Ut vulputate
   ex elit, quis sed.`,
    },
  ];

  componentWillUnmount() {
    this.eventsSub.unsubscribe();
    this.notificationSub.unsubscribe();
  }

  componentDidMount() {
    const mountTime = moment().subtract(5, 'seconds');

    this.eventsSub = events$
      .filter(newLinodeEvents(mountTime))
      .subscribe((linodeEvent) => {
        Axios.get(`${API_ROOT}/linode/instances/${(linodeEvent.entity as Linode.Entity).id}`)
          .then(response => response.data)
          .then(linode => this.setState((prevState) => {
            const targetIndex = prevState.linodes.findIndex(
              _linode => _linode.id === (linodeEvent.entity as Linode.Entity).id);
            const updatedLinodes = clone(prevState.linodes);
            updatedLinodes[targetIndex] = linode;
            updatedLinodes[targetIndex].recentEvent = linodeEvent;
            return { linodes: updatedLinodes };
          }));
      });

    this.notificationSub = Observable
      .combineLatest(
        notifications$
          .map(notifications => notifications.filter(n => n.entity.type === 'linode')),
        Observable.of(this.props.linodes),
      )
      .map(([notifications, linodes]) => {
        /** Imperative and gross a/f. Ill fix it. */
        linodes.response.data = linodes.response.data.map((linode) => {
          const notification = notifications.find(n => n.entity.id === linode.id);
          if (notification) {
            linode.notification = notification.message;
            return linode;
          }

          return linode;
        });

        return linodes;
      })
      .subscribe(response => this.setState({ linodes: response.response.data }));
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
    types: Linode.LinodeType[],
  ) => {
    return (
      <LinodesListView
        linodes={linodes}
        images={images}
        types={types}
        openConfigDrawer={this.openConfigDrawer}
      />
    );
  }

  renderGridView = (
    linodes: Linode.Linode[],
    images: Linode.Image[],
    types: Linode.LinodeType[],
  ) => {
    return (
      <LinodesGridView
        linodes={linodes}
        images={images}
        types={types}
        openConfigDrawer={this.openConfigDrawer}
      />
    );
  }

  getLinodes = (page = 1, pageSize = 25) => {
    const lastPage = Math.ceil(this.state.results / pageSize);

    Axios.get(`${API_ROOT}/linode/instances`, {
      params: {
        page: Math.min(lastPage, page),
        page_size: pageSize,
      },
    })
      .then((response: AxiosResponse<Linode.ManyResourceState<Linode.Linode>>) => response.data)
      .then((response) => {
        this.setState(prevResults => ({
          ...prevResults,
          linodes: pathOr([], ['data'], response),
          page: pathOr(0, ['page'], response),
          pages: pathOr(0, ['pages'], response),
          results: pathOr(0, ['results'], response),
          pageSize,
        }));
      });
  }

  handlePageSelection = (page: number) => {
    this.getLinodes(Math.min(page), this.state.pageSize);
  }

  handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.getLinodes(this.state.page, parseInt(event.target.value, 0));
  }

  selectConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    this.setState(prevState => ({
      configDrawer: {
        ...prevState.configDrawer,
        selected: value,
      },
    }));
  }

  submitConfigChoice = () => {
    const { action, selected } = this.state.configDrawer;
    if (selected) {
      action(selected);
      this.closeConfigDrawer();
    }
  }

  render() {
    return (
      <WithDocumentation
        title="Linodes"
        docs={this.docs}
        render={() => {
          const { types, location: { hash } } = this.props;
          const { linodes, configDrawer } = this.state;
          const images = pathOr([], ['response', 'data'], this.props.images);

          if (this.props.linodes.error) {
            /** Maybe a fancy error state component? */
            return (
              <ErrorState errorText="Error loading data" />
            );
          }

          if (this.props.images.error) {
            /** Maybe a fancy error state component? */
            return (
              <ErrorState errorText="Error loading data" />
            );
          }

          if (linodes.length === 0) {
            return <ListLinodesEmptyState />;
          }

          const displayGrid: 'grid' | 'list' = ifElse(
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
          )({ hash, length: linodes.length });

          return (
            <React.Fragment>
              <Hidden mdUp>
                {this.renderGridView(linodes, images, types)}
              </Hidden>
              <Hidden smDown>
                <ToggleBox
                  handleClick={this.changeViewStyle}
                  status={displayGrid}
                />
                {displayGrid === 'grid'
                  ? this.renderGridView(linodes, images, types)
                  : this.renderListView(linodes, images, types)
                }
              </Hidden>
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
            </React.Fragment>
          );
        }}
      />
    );
  }
}

export const RoutedListLinodes = withRouter(ListLinodes);

const ConnectedListLinodes = connect<Props>(mapStateToProps)(
  RoutedListLinodes,
);

export default preloaded(ConnectedListLinodes);

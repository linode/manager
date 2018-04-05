import * as React from 'react';
import Axios, { AxiosResponse } from 'axios';
import * as moment from 'moment';
import { clone, pathOr, ifElse, compose, prop, propEq, isEmpty, gte } from 'ramda';
import { connect } from 'react-redux';
import { Subscription } from 'rxjs/Rx';
import Hidden from 'material-ui/Hidden';

import { API_ROOT } from 'src/constants';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import {
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';

import { events$ } from 'src/events';
import ErrorState from 'src/components/ErrorState';
import WithDocumentation from 'src/components/WithDocumentation';

import LinodesListView from './LinodesListView';
import LinodesGridView from './LinodesGridView';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import PaginationFooter from '../../../components/PaginationFooter';
import ToggleBox from './ToggleBox';

import './linodes.css';

interface Props { }

interface ConnectedProps {
  types: Linode.LinodeType[];
}

interface PreloadedProps {
  linodes: PromiseLoaderResponse<Linode.ManyResourceState<Linode.Linode>>;
  images: PromiseLoaderResponse<Linode.ManyResourceState<Linode.Image>>;
}

interface State {
  linodes: (Linode.Linode & { recentEvent?: Linode.Event })[];
  page: number;
  pages: number;
  results: number;
  pageSize: number;
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
  subscription: Subscription;

  state: State = {
    linodes: pathOr([], ['response', 'data'], this.props.linodes),
    page: pathOr(-1, ['response', 'page'], this.props.linodes),
    pages: pathOr(-1, ['response', 'pages'], this.props.linodes),
    results: pathOr(0, ['response', 'results'], this.props.linodes),
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
    this.subscription.unsubscribe();
  }

  componentDidMount() {
    const mountTime = moment().subtract(5, 'seconds');
    this.subscription = events$
      .filter((linodeEvent) => {

        const actionWhitelist = [
          'linode_boot',
          'linode_reboot',
          'linode_shutdown',
        ];

        const statusWhitelist = [
          'started',
          'finished',
          'scheduled',
          'failed',
        ];

        const isLinodeEvent = linodeEvent.entity !== null && linodeEvent.entity.type === 'linode';
        const createdAfterMountTime = moment(linodeEvent.created + 'Z') > mountTime;
        const isPendingCompletion = linodeEvent.percent_complete !== null
          && linodeEvent.percent_complete < 100;

        const result = isLinodeEvent
          && statusWhitelist.includes(linodeEvent.status)
          && actionWhitelist.includes(linodeEvent.action)
          && (createdAfterMountTime || isPendingCompletion);

          return result;
      })
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

  render() {
    return (
      <WithDocumentation
        title="Linodes"
        docs={this.docs}
        render={() => {
          const { types, location: { hash } } = this.props;
          const { linodes } = this.state;
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

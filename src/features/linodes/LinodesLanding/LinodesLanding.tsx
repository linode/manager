import * as React from 'react';
import Axios from 'axios';
import * as moment from 'moment';
import { clone, pathOr, ifElse, compose, prop, propEq, isEmpty, gte } from 'ramda';
import { connect } from 'react-redux';

import { API_ROOT } from 'src/constants';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import {
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';

import { linodeEvents$ } from 'src/events';
import ErrorState from 'src/components/ErrorState';
import WithDocumentation from 'src/components/WithDocumentation';

import LinodesListView from './LinodesListView';
import LinodesGridView from './LinodesGridView';
import ListLinodesEmptyState from './ListLinodesEmptyState';
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
}

const mapStateToProps = (state: Linode.AppState) => ({
  types: pathOr({}, ['resources', 'types', 'data', 'data'], state),
});

const preloaded = PromiseLoader<Props>({
  linodes: () => Axios.get(`${API_ROOT}/linode/instances`)
    .then(response => response.data),

  images: () => Axios.get(`${API_ROOT}/images`)
    .then(response => response.data),
});

type CombinedProps = Props & ConnectedProps & PreloadedProps & RouteComponentProps<{}>;


class ListLinodes extends React.Component<CombinedProps, State> {
  state: State = {
    linodes: pathOr([], ['response', 'data'], this.props.linodes),
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

  componentDidMount() {
    const mountTime = moment();

    linodeEvents$
    .filter((linodeEvent) => {
      return (
        moment(linodeEvent.created + 'Z') > mountTime
        && linodeEvent.entity !== null
        && linodeEvent.entity.type === 'linode'
      );
    })
    .subscribe((linodeEvent) => {
      Axios.get(`${API_ROOT}/linode/instances/${(linodeEvent.entity as Linode.EventEntity).id}`)
        .then(response => response.data)
        .then(linode => this.setState((prevState) => {
          const targetIndex = prevState.linodes.findIndex(
            _linode => _linode.id === (linodeEvent.entity as Linode.EventEntity).id);
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
              <ToggleBox
                handleClick={this.changeViewStyle}
                status={displayGrid}
              />
              {displayGrid === 'grid'
                ? <LinodesGridView
                  linodes={linodes}
                  images={images}
                  types={types}
                />
                : <LinodesListView
                  linodes={linodes}
                  images={images}
                  types={types}
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

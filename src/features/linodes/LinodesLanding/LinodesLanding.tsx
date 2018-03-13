import * as React from 'react';
import Axios from 'axios';
import { pathOr } from 'ramda';
import { connect } from 'react-redux';

import { API_ROOT } from 'src/constants';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import {
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';

import ErrorState from 'src/components/ErrorState';
import WithDocumentation from 'src/components/WithDocumentation';
import  { Action } from 'src/components/ActionMenu';

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

const genActionMenuItems = (push: Function) => (linode: Linode.Linode): Action[] => {
  return [
    {
      title: 'Launch Console',
      onClick: (e) => {
        e.preventDefault();
      },
    },
    {
      title: 'Reboot',
      onClick: (e) => {
        e.preventDefault();
      },
    },
    {
      title: 'View Graphs',
      onClick: (e) => {
        push(`/linodes/${linode.id}/summary`);
        e.preventDefault();
      },
    },
    {
      title: 'Resize',
      onClick: (e) => {
        e.preventDefault();
      },
    },
    {
      title: 'View Backups',
      onClick: (e) => {
        push(`/linodes/${linode.id}/backups`);
        e.preventDefault();
      },
    },
    {
      title: 'Power On',
      onClick: (e) => {
        e.preventDefault();
      },
    },
    {
      title: 'Settings',
      onClick: (e) => {
        push(`/linodes/${linode.id}/settings`);
        e.preventDefault();
      },
    },
  ];
};

class ListLinodes extends React.Component<CombinedProps, State> {
  state: State = {};

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
          const linodes = pathOr([], ['response', 'data'], this.props.linodes);
          const images = pathOr([], ['response', 'data'], this.props.images);
          const createActions = genActionMenuItems(this.props.history.push);

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

          return (
            <React.Fragment>
              <ToggleBox
                handleClick={this.changeViewStyle}
                status={hash === '#grid' ? 'grid' : 'list'}
              />
              {hash === '#grid'
                ? <LinodesGridView
                  linodes={linodes}
                  images={images}
                  types={types}
                  createActions={createActions}
                />
                : <LinodesListView
                  linodes={linodes}
                  images={images}
                  types={types}
                  createActions={createActions}
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

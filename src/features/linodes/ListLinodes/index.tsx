import * as React from 'react';
import { connect } from 'react-redux';
import {
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';
import { pathOr } from 'ramda';

import WithDocumentation from 'src/components/WithDocumentation';

import LinodesListView from './LinodesListView';
import LinodesGridView from './LinodesGridView';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import ToggleBox from './ToggleBox';

import './linodes.css';

interface Props {
  linodes: Linode.Linode[];
  images: Linode.Image[];
  types: Linode.LinodeType[];
}

type CombinedProps = Props & RouteComponentProps<{}>;

export class ListLinodes extends React.Component<CombinedProps> {
  static defaultProps = {
    linodes: [],
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

  changeViewStyle = (style: string) => {
    const { history } = this.props;
    history.push(`#${style}`);
  }

  listLinodes() {
    const { location: { hash } } = this.props;

    return (
      <React.Fragment>
        <ToggleBox
          handleClick={this.changeViewStyle}
          status={hash === '#grid' ? 'grid' : 'list'}
        />
        {hash === '#grid'
          ? <LinodesGridView
            linodes={this.props.linodes}
            images={this.props.images}
            types={this.props.types}
          />
          : <LinodesListView
            linodes={this.props.linodes}
            images={this.props.images}
            types={this.props.types}
          />
        }
      </React.Fragment>
    );
  }

  render() {
    const { linodes } = this.props;
    return (
      <WithDocumentation
        title="Linodes"
        docs={this.docs}
        render={() =>
          linodes.length > 0
            ? this.listLinodes()
            : <ListLinodesEmptyState />}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  linodes: pathOr([], ['api', 'linodes', 'data'], state),
  types: pathOr([], ['api', 'linodeTypes', 'data'], state),
  images: pathOr([], ['api', 'images', 'data'], state),
});

export const RoutedListLinodes = withRouter(ListLinodes);

const ConnectedListLinodes = connect<Props>(mapStateToProps)(
  RoutedListLinodes,
);

export default ConnectedListLinodes;

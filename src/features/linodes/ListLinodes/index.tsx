import * as React from 'react';
import Axios from 'axios';
import { path, pathOr, find } from 'ramda';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Grid from 'material-ui/Grid';
import Table from 'material-ui/Table';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import TableBody from 'material-ui/Table/TableBody';

import { API_ROOT } from 'src/constants';
import PromiseLoader from 'src/components/PromiseLoader';
import WithDocumentation from 'src/components/WithDocumentation';
import LinodeRow from './LinodeRow';
import ListLinodesEmptyState from './ListLinodesEmptyState';

interface Props { }

interface ConnectedProps {
  types: Linode.LinodeType[];
}

interface PreloadedProps {
  linodes: Linode.Linode[];
  images: Linode.Image[];
}

interface State {
}

const mapStateToProps = (state: Linode.AppState) => ({
  types: pathOr({}, ['resources', 'types', 'data'], state),
});

const connected = connect(mapStateToProps);

const preloaded = PromiseLoader<Props>({
  linodes: () => Axios.get(`${API_ROOT}/linode/instances`)
    .then(pathOr({}, ['data'])),

  images: () => Axios.get(`${API_ROOT}/images`)
    .then(pathOr({}, ['data'])),
});

type CombinedProps = Props & ConnectedProps & PreloadedProps;

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

  listLinodes() {
    const { linodes, types, images } = this.props;

    const findInTypes = findIn<Linode.LinodeType>(types);

    const findInImages = findIn<Linode.Image>(images);

    return (
      <Grid container>
        <Grid item xs={12}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>IP Addresses</TableCell>
                <TableCell>Region</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                linodes.map((l, idx) => <LinodeRow
                  key={idx}
                  linode={l}
                  memory={path(['memory'], findInTypes(t => t.id === l.type))}
                  image={path(['label'], findInImages(i => i.id === l.image))}
                />)
              }
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    );
  }

  render() {
    const { linodes } = this.props;
    return (
      <WithDocumentation
        title="Linodes"
        docs={this.docs}
        render={() =>
          linodes && linodes.length > 0
            ? this.listLinodes()
            : <ListLinodesEmptyState />}
      />
    );
  }
}

export default compose(
  connected,
  preloaded,
)(ListLinodes);

function findIn<P>(collection: P[] = []) {
  return function (pred: (i: P) => boolean): P | undefined {
    return find(pred, collection);
  };
}

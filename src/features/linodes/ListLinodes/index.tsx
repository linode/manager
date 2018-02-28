import * as React from 'react';
import Axios from 'axios';
import { path, find } from 'ramda';

import Grid from 'material-ui/Grid';
import Table from 'material-ui/Table';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import TableBody from 'material-ui/Table/TableBody';

import { API_ROOT } from 'src/constants';
import Preload from 'src/components/AxiosPreloader';
import WithDocumentation from 'src/components/WithDocumentation';
import LinodeRow from './LinodeRow';
import ListLinodesEmptyState from './ListLinodesEmptyState';

interface Props { }

interface PreloadedProps {
  linodes: Linode.ManyResourceState<Linode.Linode>;
  images: Linode.ManyResourceState<Linode.Image>;
  types: Linode.ManyResourceState<Linode.LinodeType>;
}

interface State {
}

const preload = Preload<Props>({
  linodes: () => Axios.get(`${API_ROOT}/linode/instances`),
  types: () => Axios.get(`${API_ROOT}/linode/types`),
  images: () => Axios.get(`${API_ROOT}/images`),
});

class ListLinodes extends React.Component<Props & PreloadedProps, State> {
  state: State = {};

  static defaultProps = {
    linodes: [],
    types: [],
    images: [],
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

  listLinodes() {
    const {
      linodes: { data: linodes },
      types: { data: types },
      images: { data: images },
    } = this.props;
    if (!linodes) { return null; }

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
    const { linodes: { data: linodes } } = this.props;
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

export default preload(ListLinodes);

function findIn<P>(collection: P[] = []) {
  return function (pred: (i: P) => boolean): P | undefined {
    return find(pred, collection);
  };
}

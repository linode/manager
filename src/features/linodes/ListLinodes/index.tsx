import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { pathOr } from 'ramda';

import Grid from 'material-ui/Grid';
import Table from 'material-ui/Table';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import TableBody from 'material-ui/Table/TableBody';

import WithDocumentation from 'src/components/WithDocumentation';
import LinodeRow from './LinodeRow';
import ListLinodesEmptyState from './ListLinodesEmptyState';

interface Props {
  linodes: Linode.Linode[];
}

class ListLinodes extends React.Component<Props> {
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

  listLinodes() {
    const { linodes } = this.props;

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
              {linodes.map((l, idx) => <LinodeRow key={idx} linode={l} />)}
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
          linodes.length > 0
            ? this.listLinodes()
            : <ListLinodesEmptyState />}
      />
    );
  }
}

const mapStateToProps = (state: any) => ({
  linodes: pathOr([], ['api', 'linodes', 'data'], state),
});

export default compose(
  connect<Props>(mapStateToProps),
)(ListLinodes);

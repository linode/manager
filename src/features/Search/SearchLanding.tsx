import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import {compose} from 'ramda';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import ExpansionPanel from 'src/components/ExpansionPanel';
import PaginationFooter from 'src/components/PaginationFooter';
import TableRowEmptyState from 'src/components/TableRowEmptyState';

import { parseQueryParams } from 'src/utilities/queryParams';

import { getLinodes } from 'src/services/linodes';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {}

interface Query {
  query: string;
}

interface State {
  query: Query;
  linodes: Linode.Linode[];
  volumes: Linode.Volume[];
  domains: Linode.Domain[];
  stackScripts: Linode.StackScript.Response[];
  nodeBalancers: Linode.NodeBalancer[];
}

type CombinedProps = Props
  & RouteComponentProps<{}>
  & WithStyles<ClassNames>;

class SearchLanding extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);

    /*
    * Will look like this: { query: 'hello world' }
    */
    const query = parseQueryParams(props.location.search.replace('?', '')) as Query;

    this.state = {
      query,
      linodes: [],
      volumes: [],
      domains: [],
      stackScripts: [],
      nodeBalancers: [],
    }
  }

  componentDidMount() {
    const { query: { query } } = this.state;
    Promise.all([
      getLinodes(
        { page: 1, page_size: 25 },
        {
          "label": query,
        }
      )])
      .then(response => {
        const linodeData = response[0].data;
        this.setState({
          linodes: linodeData,
        })
      })
      .catch(e => e);
  }

  renderPanels = () => {
    const { linodes } = this.state;

    const iterables = [
      {
        label: 'Linodes',
        data: linodes,
      }
    ];

    console.log(this.state.linodes);

    return iterables.map(iterable => {
      return (
        <ExpansionPanel
          heading="Linodes"
          key={iterable.label}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>{iterable.label}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!iterable.data.length)
                ? <TableRowEmptyState colSpan={2} />
                : iterable.data.map(eachEntity => this.renderPanelRow(eachEntity))}
            </TableBody>
          </Table>
          {true &&
            <PaginationFooter
              count={25}
              page={1}
              pageSize={25}
              handlePageChange={() => console.log('change page')}
              handleSizeChange={() => console.log('change size')}
            />
          }
        </ExpansionPanel>
      )
    })
  }

  renderPanelRow = (data: any) => {
    return (
      <TableRow key={data.label}>
        <TableCell></TableCell>
        <TableCell>{data.label}</TableCell>
      </TableRow>
    )
  }

  render() {
    return (
      this.renderPanels()
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  withRouter,
  styled,
)(SearchLanding);

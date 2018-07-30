import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { compose } from 'ramda';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import CircularProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';

import { parseQueryParams } from 'src/utilities/queryParams';

import { getDomains } from 'src/services/domains';
import { getLinodes } from 'src/services/linodes';
import { getNodeBalancers } from 'src/services/nodebalancers';
import { getStackscripts } from 'src/services/stackscripts';
import { getVolumes } from 'src/services/volumes';

import SearchResultsPanel from './SearchResultsPanel';

type ClassNames = 'root' 
  | 'noResultsText'
  | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  noResultsText: {
    textAlign: "center",
    marginTop: theme.spacing.unit * 10
  },
});

interface Props {}

interface Query {
  query: string;
}

interface State {
  query: Query;
  linodes: Linode.ResourcePage<Linode.Linode>;
  volumes: Linode.ResourcePage<Linode.Volume>;
  domains: Linode.ResourcePage<Linode.Domain>;
  stackScripts: Linode.ResourcePage<Linode.StackScript.Response>;
  nodeBalancers: Linode.ResourcePage<Linode.NodeBalancer>;
  isLoading: boolean;
  error?: Error;
  pageSize: number;
  currentPage: number;
  numberOfResults: number;
}

type CombinedProps = Props
  & RouteComponentProps<{}>
  & WithStyles<ClassNames>;

type MultipleEntity = Linode.ResourcePage<(Linode.Linode
  | Linode.Volume
  | Linode.Domain
  | Linode.StackScript.Response
  | Linode.NodeBalancer)>;

interface Iterable {
  label: string,
  data: MultipleEntity,
}

type RequestType = 'linode'
| 'volume'
| 'domain'
| 'stackscript'
| 'nodebalancer';

const getFilter = (whichRequest: RequestType, filterTerm: string) => {
  switch (whichRequest) {
    case 'linode':
    case 'volume':
    case 'nodebalancer':
      return {
        "label": {
          ["+contains"]: filterTerm
        },
      }
    case 'stackscript':
      return {
        ["+or"]: [{
          "label": {
            ["+contains"]: filterTerm
          },
          "description": {
            ["+contains"]: filterTerm
          }
        }]
      }
    case 'domain':
      return {
        "domain": {
          ["+contains"]: filterTerm
        },
      }
    default:
      return {
        "label": {
          ["+contains"]: filterTerm
        },
      }
  }
}

class SearchLanding extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);

    /*
    * Will look like this: { query: 'hello world' }
    */
    const query = parseQueryParams(this.props.location.search.replace('?', '')) as Query;

    const defaultData = {
      data: [],
      results: 0,
      page: 1,
      pages: 1,
    }

    this.state = {
      query,
      linodes: defaultData,
      volumes: defaultData,
      domains: defaultData,
      stackScripts: defaultData,
      nodeBalancers: defaultData,
      isLoading: true,
      error: undefined,
      pageSize: 25,
      currentPage: 1,
      numberOfResults: 0,
    }
  }

  componentDidMount() {
    const { query: { query } } = this.state;

    Promise.all([
      getLinodes(
        { page: 1, page_size: 25 },
        getFilter('linode', query)
      ),
      getVolumes(
        { page: 1, page_size: 25 },
        getFilter('volume', query)
      ),
      getDomains(
        { page: 1, page_size: 25 },
        {
          "domain": {
            ["+contains"]: query
          },
        }
      ),
      getNodeBalancers(
        { page: 1, page_size: 25 },
        getFilter('nodebalancer', query)
      ),
      getStackscripts(
        { page: 1, page_size: 25 },
        getFilter('stackscript', query)
      )
    ])
      .then(response => {
        const linodeData = response[0];
        const volumesData = response[1];
        const domainsData = response[2];
        const nodeBalancersData = response[3];
        const stackScriptsData = response[4];
        this.setState({
          linodes: linodeData,
          volumes: volumesData,
          domains: domainsData,
          nodeBalancers: nodeBalancersData,
          stackScripts: stackScriptsData,
          isLoading: false,
          numberOfResults: linodeData.results
            + volumesData.results
            + domainsData.results
            + nodeBalancersData.results
            + stackScriptsData.results
        })
      })
      .catch(e => {
        this.setState({
          isLoading: false,
          error: new Error(`There was an issue retrieving your search results.
          Please try again later.`)
        })
      });
  }
  
  handleChangePageSize = (newPageSize: number) => {
    this.setState({ pageSize: +newPageSize })
  }

  handlePageChange = (newPage: number) => {
    this.setState({ currentPage: newPage })
  }

  renderPanels = () => {
    const {
      domains,
      linodes,
      nodeBalancers,
      stackScripts,
      volumes,
      query: { query },
    } = this.state;

    const iterables = [
      {
        label: 'Linodes',
        data: linodes,
        requestInfo: {
          request: getLinodes,
          filter: getFilter('linode', query)
        }
      },
      {
        label: 'Volumes',
        data: volumes,
        requestInfo: {
          request: getVolumes,
          filter: getFilter('volume', query)
        }
      },
      {
        label: 'Domains',
        data: domains,
        requestInfo: {
          request: getDomains,
          filter: getFilter('domain', query)
        }
      },
      {
        label: 'NodeBalancers',
        data: nodeBalancers,
        requestInfo: {
          request: getNodeBalancers,
          filter: getFilter('nodebalancer', query)
        }
      },
      {
        label: 'StackScripts',
        data: stackScripts,
        requestInfo: {
          request: getStackscripts,
          filter: getFilter('stackscript', query)
        }
      },
    ];

    return iterables.map((iterable: Iterable) => {
      if (!iterable.data.data.length) { return; }
      return (
        <SearchResultsPanel
          key={iterable.label}
          data={iterable.data}
          label={iterable.label}
          handlePageChange={this.handlePageChange}
          handleSizeChange={this.handleChangePageSize}
          currentPage={this.state.currentPage}
          pageSize={this.state.pageSize}
          history={this.props.history}
        />
      )
    })
  }

  render() {
    const { classes } = this.props;
    if (!!this.state.error) { return <ErrorState errorText={this.state.error.message} /> }
    if (this.state.isLoading) { return <CircularProgress /> }
    return (
      <React.Fragment>
        <Typography variant="headline" className={classes.title}>
          {`Search Results for "${this.state.query.query}"`}
        </Typography>
        {(this.state.numberOfResults === 0)
          ? <Typography className={classes.noResultsText} variant="subheading">
            No Results
          </Typography>
          : this.renderPanels()
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  withRouter,
  styled
)(SearchLanding);

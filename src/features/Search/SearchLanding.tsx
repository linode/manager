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

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 3,
    color: theme.color.grey1,
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
  numberOfResults: number;
  numberOfVisibleResults: number;
}

type CombinedProps = Props
  & RouteComponentProps<{}>
  & WithStyles<ClassNames>;

type MultipleEntity = Linode.ResourcePage<(Linode.Linode
  | Linode.Volume
  | Linode.Domain
  | Linode.StackScript.Response
  | Linode.NodeBalancer)>;

interface RequestInfo {
  requestFn: () => Promise<{}>;
  filter: any;
  updateStateHandler: (newData: Linode.ResourcePage<any>) => void;
 }

interface Iterable {
  label: string,
  data: MultipleEntity,
  requestInfo: RequestInfo
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

export class SearchLanding extends React.Component<CombinedProps, State> {
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
      numberOfVisibleResults: 0,
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
            + stackScriptsData.results,
          numberOfVisibleResults: linodeData.data.length
            + volumesData.data.length
            + domainsData.data.length
            + nodeBalancersData.data.length
            + stackScriptsData.data.length,
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

  /*
  * START get more update handlers
  * 
  * Basically, when a user changes the page size or requests the next
  * page of search results, we need to both update the displayed data
  * and update the actual number of results displayed, so that we can
  * display to the user, "Showing 23 out of 100 results"
  */

  handleGetMoreLinodes = (newData: Linode.ResourcePage<Linode.Linode>) => {
    const { volumes, nodeBalancers, domains, stackScripts } = this.state;
    const newNumberOfVisibleResults = newData.data.length
      + volumes.data.length
      + stackScripts.data.length
      + nodeBalancers.data.length
      + domains.data.length;
    this.setState({ linodes: newData, numberOfVisibleResults: newNumberOfVisibleResults });
  }

  handleGetMoreVolumes = (newData: Linode.ResourcePage<Linode.Volume>) => {
    const { domains, nodeBalancers, linodes, stackScripts } = this.state;
    const newNumberOfVisibleResults = newData.data.length
      + domains.data.length
      + stackScripts.data.length
      + nodeBalancers.data.length
      + linodes.data.length;
    this.setState({ volumes: newData, numberOfVisibleResults: newNumberOfVisibleResults });
  }

  handleGetMoreStackScripts = (newData: Linode.ResourcePage<Linode.StackScript.Response>) => {
    const { volumes, nodeBalancers, linodes, domains } = this.state;
    const newNumberOfVisibleResults = newData.data.length
      + volumes.data.length
      + domains.data.length
      + nodeBalancers.data.length
      + linodes.data.length;
    this.setState({ stackScripts: newData, numberOfVisibleResults: newNumberOfVisibleResults });
  }

  handleGetMoreDomains = (newData: Linode.ResourcePage<Linode.Domain>) => {
    const { volumes, nodeBalancers, linodes, stackScripts } = this.state;
    const newNumberOfVisibleResults = newData.data.length
      + volumes.data.length
      + stackScripts.data.length
      + nodeBalancers.data.length
      + linodes.data.length;
    this.setState({ domains: newData, numberOfVisibleResults: newNumberOfVisibleResults });
  }

  handleGetMoreNodeBalancers = (newData: Linode.ResourcePage<Linode.NodeBalancer>) => {
    const { volumes, domains, linodes, stackScripts } = this.state;
    const newNumberOfVisibleResults = newData.data.length
      + volumes.data.length
      + stackScripts.data.length
      + domains.data.length
      + linodes.data.length;
    this.setState({ nodeBalancers: newData, numberOfVisibleResults: newNumberOfVisibleResults });
  }

  /*
  * END get more update handlers
  */

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
          requestFn: getLinodes,
          filter: getFilter('linode', query),
          updateStateHandler: this.handleGetMoreLinodes,
        }
      },
      {
        label: 'Volumes',
        data: volumes,
        requestInfo: {
          requestFn: getVolumes,
          filter: getFilter('volume', query),
          updateStateHandler: this.handleGetMoreVolumes,
        }
      },
      {
        label: 'Domains',
        data: domains,
        requestInfo: {
          requestFn: getDomains,
          filter: getFilter('domain', query),
          updateStateHandler: this.handleGetMoreDomains,
        }
      },
      {
        label: 'NodeBalancers',
        data: nodeBalancers,
        requestInfo: {
          requestFn: getNodeBalancers,
          filter: getFilter('nodebalancer', query),
          updateStateHandler: this.handleGetMoreNodeBalancers,
        }
      },
      {
        label: 'StackScripts',
        data: stackScripts,
        requestInfo: {
          requestFn: getStackscripts,
          filter: getFilter('stackscript', query),
          updateStateHandler: this.handleGetMoreStackScripts,
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
          history={this.props.history}
          requestInfo={{
            requestFn: iterable.requestInfo.requestFn,
            filter: iterable.requestInfo.filter,
            updateStateHandler: iterable.requestInfo.updateStateHandler,
          }}
        />
      )
    })
  }

  render() {
    const { classes } = this.props;
    const { numberOfResults, numberOfVisibleResults } = this.state;

    if (!!this.state.error) { return <ErrorState errorText={this.state.error.message} /> }
    if (this.state.isLoading) { return <CircularProgress /> }
    return (
      <React.Fragment>
        <Typography variant="headline">
          {`Search Results for "${this.state.query.query}"`}
        </Typography>
        <Typography variant="subheading" className={classes.title}>
          {`Showing ${numberOfVisibleResults} Results out of ${numberOfResults}`}
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

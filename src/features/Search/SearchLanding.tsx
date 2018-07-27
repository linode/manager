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
import Typography from '@material-ui/core/Typography';
import CircularProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import ExpansionPanel from 'src/components/ExpansionPanel';
import PaginationFooter from 'src/components/PaginationFooter';

import { parseQueryParams } from 'src/utilities/queryParams';

import { getDomains } from 'src/services/domains';
import { getLinodes } from 'src/services/linodes';
import { getNodeBalancers } from 'src/services/nodebalancers';
import { getStackscripts } from 'src/services/stackscripts';
import { getVolumes } from 'src/services/volumes';

import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodeBalancerIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import StackScriptIcon from 'src/assets/addnewmenu/stackscripts.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';

import ClickableRow from './ClickableRow';

type ClassNames = 'root' | 'icon' | 'noResultsText';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  icon: {
    width: 100,
  },
  noResultsText: {
    textAlign: "center",
    marginTop: theme.spacing.unit * 10
  }
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

class SearchLanding extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);

    /*
    * Will look like this: { query: 'hello world' }
    */
    const query = parseQueryParams(props.location.search.replace('?', '')) as Query;

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

    const filter = {
      "label": {
        ["+contains"]: query
      },
    }

    Promise.all([
      getLinodes(
        { page: 1, page_size: 25 },
        filter
      ),
      getVolumes(
        { page: 1, page_size: 25 },
        filter
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
        filter
      ),
      getStackscripts(
        { page: 1, page_size: 25 },
        {
          ["+or"]: [{
            "label": {
              ["+contains"]: query
            },
            "description": {
              ["+contains"]: query
            }
          }]
        }
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

  /**
   * @param type string - correlates with the 'label' prop
   * on each of the iterables objects
   */
  getRelevantIcon = (type: string) => {
    switch (type) {
      case 'Linodes':
        return <LinodeIcon />
      case 'Volumes':
        return <VolumeIcon />
      case 'StackScripts':
        return <StackScriptIcon />
      case 'Domains':
        return <DomainIcon />
      case 'NodeBalancers':
        return <NodeBalancerIcon />
      default:
        return <LinodeIcon />
    }
  }
  
  handleChangePageSize = (newPageSize: number) => {
    this.setState({ pageSize: +newPageSize })
  }

  getResultUrl = (type:string, id: string) => {
    switch (type) {
      case 'Linodes':
        return `linodes/${id}`
      case 'Volumes':
        return `volumes/${id}`
      case 'StackScripts':
        // @todo update to SS detail page/modal
        // This is an unfortunate hack in the meantime.
        window.location.href = `https://www.linode.com/stackscripts/view/${id}`
      case 'Domains':
        return `domains/${id}`
      case 'NodeBalancers':
        return `nodebalancers/${id}`;
      default:
        return '';
    }
  }

  handleItemRowClick = (id: string, type: string) => {
    const url:string = this.getResultUrl(type, id);
    if (!url) { return; }
    this.props.history.push(url);
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
     } = this.state;

    const iterables = [
      {
        label: 'Linodes',
        data: linodes,
      },
      {
        label: 'Volumes',
        data: volumes,
      },
      {
        label: 'Domains',
        data: domains,
      },
      {
        label: 'NodeBalancers',
        data: nodeBalancers,
      },
      {
        label: 'StackScripts',
        data: stackScripts,
      },
    ];

    return iterables.map((iterable: Iterable) => {
      if (!iterable.data.data.length) { return; }
      return (
        <ExpansionPanel
          heading={iterable.label}
          key={iterable.label}
          defaultExpanded={!!iterable.data.data.length}
        >
          <Table>
            <TableBody>
              {iterable.data.data.map((eachEntity: any) =>
                this.renderPanelRow(iterable.label, eachEntity))}
            </TableBody>
          </Table>
          {iterable.data.results > 25 &&
            <PaginationFooter
              count={iterable.data.results}
              page={this.state.currentPage}
              pageSize={this.state.pageSize}
              handlePageChange={this.handlePageChange}
              handleSizeChange={this.handleChangePageSize}
            />
          }
        </ExpansionPanel>
      )
    })
  }

  renderPanelRow = (type: string, data: any) => {
    /*
    * Domains don't have labels
    */
    const title = (!!data.label)
      ? data.label
      : data.domain

    const { classes } = this.props;

    return (
      <ClickableRow
        type={type}
        id={data.id}
        key={data.id}
        handleClick={this.handleItemRowClick}
      >
        <TableCell className={classes.icon}>{this.getRelevantIcon(type)}</TableCell>
        <TableCell>{title}</TableCell>
      </ClickableRow>
    )
  }

  render() {
    const { classes } = this.props;
    if (!!this.state.error) { return <ErrorState errorText={this.state.error.message} /> }
    if (this.state.isLoading) { return <CircularProgress /> }
    return (
      <React.Fragment>
        <Typography variant="headline">
          {`Search Results for ${this.state.query.query}`}
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
  styled,
)(SearchLanding);

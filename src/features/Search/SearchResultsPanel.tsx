import * as classNames from 'classnames';
import * as H from 'history';
import * as React from 'react';

import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ErrorState from 'src/components/ErrorState'
import LinearProgress from 'src/components/LinearProgress';
import PaginationFooter from 'src/components/PaginationFooter';

import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodeBalancerIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import StackScriptIcon from 'src/assets/addnewmenu/stackscripts.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';

import ClickableRow from './ClickableRow';

type ClassNames = 'root'
  | 'icon'
  | 'paginationWrapper'
  | 'resultsHeading'
  | 'emptyState'
  | 'loader';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    marginTop: theme.spacing.unit * 2,
  },
  emptyState: {
    minHeight: '1250px',
  },
  resultsHeading: {
    padding: theme.spacing.unit * 2,
    fontSize: '1.2em',
  },
  icon: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing.unit * 2,
    '& svg': {
      width: '100%',
    },
  },
  paginationWrapper: {
    padding: theme.spacing.unit * 3,
  },
  loader: {
    margin: theme.spacing.unit * 2,
  }
});

interface RequestInfo {
  requestFn: (params?: any, filter?: any) => Promise<{}>;
  filter: any;
  updateStateHandler: (newData: Linode.ResourcePage<any>) => void;
}

interface Props {
  data: any;
  label: string;
  history: H.History;
  requestInfo: RequestInfo;
}

interface State {
  pageSize: number;
  currentPage: number;
  isLoadingMoreResults: boolean;
  error?: string;
}

type CombinedProps = Props
  & WithStyles<ClassNames>;

class SearchResultsPanel extends React.Component<CombinedProps, State> {
  state: State = {
    pageSize: 25,
    currentPage: 1,
    isLoadingMoreResults: false,
  };

    
  handleChangePageSize = (newPageSize: number) => {
    const { requestInfo } = this.props;
    this.setState({
      pageSize: +newPageSize,
      currentPage: 1,
      isLoadingMoreResults: true
    })
    requestInfo.requestFn(
      { page: 1, page_size: newPageSize },
      requestInfo.filter)
      .then((data: Linode.ResourcePage<any>) => {
        this.setState({ isLoadingMoreResults: false });
        return requestInfo.updateStateHandler(data);
      })
      .catch(e => {
        this.setState({
          isLoadingMoreResults: false,
          error: "There was an error retrieving results. Please try again."
        });
        return e;
      });
  }

  handlePageChange = (newPage: number) => {
    const { requestInfo } = this.props;
    this.setState({
      currentPage: newPage,
      isLoadingMoreResults: true
    })
    requestInfo.requestFn(
      { page: newPage, page_size: this.state.pageSize },
      requestInfo.filter)
      .then((data: Linode.ResourcePage<any>) => {
        this.setState({ isLoadingMoreResults: false });
        return requestInfo.updateStateHandler(data);
      })
      .catch(e => {
        this.setState({
          isLoadingMoreResults: false,
          error: "There was an error retrieving results. Please try again."
        });
        return e;
      })
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
        window.open(`https://www.linode.com/stackscripts/view/${id}`, '_blank');
        return '';
      case 'Domains':
        return `domains/${id}`
      case 'NodeBalancers':
        return `nodebalancers/${id}`;
      default:
        return '';
    }
  }

  handleItemRowClick = (id: string, type: string) => {
    const url: string = this.getResultUrl(type, id);
    if (!url) { return; }
    this.props.history.push(url);
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
        <div className={classes.icon}>{this.getRelevantIcon(type)}</div>
        <div>{title}</div>
      </ClickableRow>
    )
  }

  renderContent = () => {
    const {
      data,
      label,
      classes
    } = this.props;

    const {
      pageSize,
      currentPage,
      isLoadingMoreResults,
      error,
    } = this.state;

    if (!!error) { return <ErrorState errorText={error} /> }

    if (isLoadingMoreResults) { return <LinearProgress className={classes.loader} /> }

    return (
      <React.Fragment>
        {data.results > 25 &&
          <div className={classes.paginationWrapper}>
            <PaginationFooter
              count={data.results}
              page={currentPage}
              pageSize={pageSize}
              handlePageChange={this.handlePageChange}
              handleSizeChange={this.handleChangePageSize}
            />
          </div>
        }
        <List>
          {data.data.map((eachEntity: any) =>
            this.renderPanelRow(label, eachEntity))}
        </List>
        {data.results > 25 &&
          <div className={classes.paginationWrapper}>
            <PaginationFooter
              count={data.results}
              page={currentPage}
              pageSize={pageSize}
              handlePageChange={this.handlePageChange}
              handleSizeChange={this.handleChangePageSize}
            />
          </div>
        }
      </React.Fragment>
    )
  }

  render() {
    const {
      classes,
      data,
      label,
    } = this.props;

    /*
    * we should give a min height to the paper element
    * if we're loading a new page of results and the previous list
    * had 25 results, so we don't get page jumping behavior
    */
    const shouldHaveMinHeight = (this.state.isLoadingMoreResults && data.data.length === 25);

    return (
      <Paper className={
        classNames({
          [classes.root]: true,
          ...(shouldHaveMinHeight && { [classes.emptyState]: true }),
        })
      }>
        <Typography
          className={classes.resultsHeading}
          variant="subheading"
        >
          {label}
        </Typography>
        {this.renderContent()}
      </Paper>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SearchResultsPanel);
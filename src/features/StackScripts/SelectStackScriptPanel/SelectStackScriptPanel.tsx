import * as React from 'react';
import * as moment from 'moment';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';

import { sort } from 'ramda';

import { getStackscripts, getMyStackscripts, getLinodeStackscripts }
  from 'src/services/stackscripts';

import Button from 'src/components/Button';
import TabbedPanel from 'src/components/TabbedPanel';
import StackScriptsSection from './StackScriptsSection';
import CircleProgress from 'src/components/CircleProgress';
import RenderGuard from 'src/components/RenderGuard';
import Table from 'src/components/Table';

export interface ExtendedLinode extends Linode.Linode {
  heading: string;
  subHeadings: string[];
}

type ClassNames = 'root'
  | 'creating'
  | 'selecting'
  | 'container'
  | 'labelCell'
  | 'stackscriptLabel'
  | 'tableHead'
  | 'table';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 3,
  },
  creating: {
    minHeight: '200px',
    maxHeight: '400px',
    overflowX: 'auto',
  },
  selecting: {
    maxHeight: '1000px',
    overflowX: 'auto',
  },
  container: {
    padding: theme.spacing.unit * 2,
  },
  table: {
    overflow: 'scroll',
  },
  labelCell: {
    background: theme.bg.offWhite,
    fontSize: '.9rem',
    fontWeight: 700,
    paddingTop: '16px !important',
    paddingBottom: '16px !important',
  },
  stackscriptLabel: {
    [theme.breakpoints.up('lg')]: {
      paddingLeft: '78px !important',
    },
  },
  tableHead: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.bg.offWhite,
    zIndex: 10,
  },
});

interface Props {
  selectedId: number | null;
  error?: string;
  shrinkPanel?: boolean;
  onSelect: (id: number, images: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]) => void;
}

type StyledProps = Props & WithStyles<ClassNames>;

type CombinedProps = StyledProps;

class SelectStackScriptPanel extends React.Component<CombinedProps> {

  render() {
    const { classes } = this.props;

    return (
      <TabbedPanel
        error={this.props.error}
        rootClass={classes.root}
        shrinkTabContent={(this.props.shrinkPanel) ? classes.creating : classes.selecting}
        header="Select StackScript"
        tabs={[
          {
            title: 'My StackScripts',
            render: () => <StyledContainer
              onSelect={this.props.onSelect}
              request={getMyStackscripts} key={0}
            />,
          },
          {
            title: 'Linode StackScripts',
            render: () => <StyledContainer
              onSelect={this.props.onSelect}
              request={getLinodeStackscripts} key={1}
            />,
          },
          {
            title: 'Community StackScripts',
            render: () => <StyledContainer
              onSelect={this.props.onSelect}
              request={getStackscripts} key={2}
            />,
          },
        ]}
      />
    );
  }
}

interface Params {
  page?: number;
  page_size?: number;
}

interface ContainerProps {
  request: (params: Params, filter: any) =>
    Promise<Linode.ResourcePage<Linode.StackScript.Response>>;
  onSelect: (id: number, images: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]) => void;
}

type CurrentFilter = 'label' | 'deploys' | 'revision';

interface ContainerState {
  currentPage: number;
  selected?: number;
  loading?: boolean;
  gettingMoreStackScripts: boolean;
  showMoreButtonVisible: boolean;
  data: any; // @TODO type correctly
  sortOrder: SortOrder;
  currentFilter: CurrentFilter | null;
}

type ContainerCombinedProps = ContainerProps & WithStyles<ClassNames>;

class Container extends React.Component<ContainerCombinedProps, ContainerState> {
  state: ContainerState = {
    currentPage: 1,
    loading: true,
    gettingMoreStackScripts: false,
    data: [],
    showMoreButtonVisible: true,
    sortOrder: 'asc',
    currentFilter: null,
  };

  getDataAtPage = (page: number) => {
    const { request } = this.props;
    this.setState({ gettingMoreStackScripts: true });

    request({ page, page_size: 50 }, { ['+order_by']: 'deployments_total', ['+order']: 'desc' })
      .then((response) => {
        if (!response.data.length) {
          this.setState({ showMoreButtonVisible: false });
        }
        this.setState({
          data: [...this.state.data, ...response.data],
          gettingMoreStackScripts: false,
          loading: false,
        });
      })
      .catch((e) => {
        this.setState({ gettingMoreStackScripts: false });
      });
  }

  componentDidMount() {
    this.getDataAtPage(0);
  }

  getNext = () => {
    this.setState(
      { currentPage: this.state.currentPage + 1 },
      () => this.getDataAtPage(this.state.currentPage),
    );
  }

  handleSelectStackScript = (stackscript: Linode.StackScript.Response) => {
    this.props.onSelect(
      stackscript.id,
      stackscript.images,
      stackscript.user_defined_fields,
    );
    this.setState({ selected: stackscript.id });
  }

  handleClickStackScriptsTableHeader = () => {
    const { sortOrder } = this.state;
    const nextSortOrder = (sortOrder === 'asc') ? 'desc' : 'asc';
    this.setState({
      data: sortByName(sortOrder)(this.state.data),
      sortOrder: nextSortOrder,
      currentFilter: 'label',
    });
  }

  handleClickDeploymentsTableHeader = () => {
    const { sortOrder } = this.state;
    const nextSortOrder = (sortOrder === 'asc') ? 'desc' : 'asc';
    this.setState({
      data: sortByDeploys(sortOrder)(this.state.data),
      sortOrder: nextSortOrder,
      currentFilter: 'deploys',
    });
  }

  handleClickRevisionsTableHeader = () => {
    const { sortOrder } = this.state;
    const nextSortOrder = (sortOrder === 'asc') ? 'desc' : 'asc';
    this.setState({
      data: sortByRevision(sortOrder)(this.state.data),
      sortOrder: nextSortOrder,
      currentFilter: 'revision',
    });
  }

  renderIcon = () => {
    const { sortOrder } = this.state;
    return (
      sortOrder === 'asc'
        ? <div>asc</div>
        : <div>desc</div>
    );
  }

  render() {
    const { classes } = this.props;
    const { currentFilter } = this.state;

    if (this.state.loading) {
      return <CircleProgress />;
    }

    return (
      <React.Fragment>
        <Table noOverflow={true} tableClass={classes.table} className={classes.container}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableHead}></TableCell>
              <TableCell
                className={classes.tableHead}
                onClick={this.handleClickStackScriptsTableHeader}
              >
                StackScripts
                {currentFilter === 'label' &&
                  this.renderIcon()}
              </TableCell>
              <TableCell
                className={classes.tableHead}
                onClick={this.handleClickDeploymentsTableHeader}
              >
                Active Deploys
                {currentFilter === 'deploys' &&
                  this.renderIcon()}
              </TableCell>
              <TableCell
                className={classes.tableHead}
                onClick={this.handleClickRevisionsTableHeader}
              >
                Last Revision
                {currentFilter === 'revision' &&
                  this.renderIcon()}
              </TableCell>
              <TableCell className={classes.tableHead}>Compatible Images</TableCell>
            </TableRow>
          </TableHead>
          <StackScriptsSection
            onSelect={this.handleSelectStackScript}
            selectedId={this.state.selected}
            data={this.state.data}
            getNext={() => this.getNext()}
          />
        </Table>
        {this.state.showMoreButtonVisible &&
          <Button
            title="Show More StackScripts"
            onClick={this.getNext}
            type="secondary"
            disabled={this.state.gettingMoreStackScripts}
            style={{ marginTop: 32 }}
          >
            {!this.state.gettingMoreStackScripts
              ? 'Show More StackScripts'
              : 'Loading...'
            }
          </Button>
        }
      </React.Fragment>
    );
  }
}

type SortOrder = 'asc' | 'desc';

const sortByName = (order: SortOrder) =>
  sort((a: Linode.StackScript.Response, b: Linode.StackScript.Response) => {
    let result = 1; // by default a > b
    if (a.label.toLowerCase() < b.label.toLowerCase()) {
      result = -1; // otherwise result is -1
    }
    if (order === 'desc') {
      return result; // descending order
    }
    return -result; // ascending order
  });

const sortByRevision = (order: SortOrder) =>
  sort((a: Linode.StackScript.Response, b: Linode.StackScript.Response) => {
    const result = moment.utc(b.updated).diff(moment.utc(a.updated));
    if (order === 'desc') {
      return -result; // descending order
    }
    return result; // ascending order
  });

const sortByDeploys = (order: SortOrder) =>
  sort((a: Linode.StackScript.Response, b: Linode.StackScript.Response) => {
    let result = 1; // by default a > b
    if (a.deployments_active < b.deployments_active) {
      result = -1; // otherwise result is -1
    }
    if (order === 'desc') {
      return result; // descending order
    }
    return -result; // ascending order
  });

const styled = withStyles(styles, { withTheme: true });

const StyledContainer = styled(Container);

export default styled(RenderGuard<CombinedProps>(SelectStackScriptPanel));

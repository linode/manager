import * as React from 'react';
import * as classNames from 'classnames';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import KeyboardArrowDown from 'material-ui-icons/KeyboardArrowDown';
import KeyboardArrowUp from 'material-ui-icons/KeyboardArrowUp';

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

type SortOrder = 'asc' | 'desc';

type ClassNames = 'root'
  | 'creating'
  | 'selecting'
  | 'stackscriptLabel'
  | 'tr'
  | 'tableHead'
  | 'sortable'
  | 'sortButton'
  | 'sortIcon'
  | 'table';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 3,
  },
  creating: {
    minHeight: '200px',
    maxHeight: '400px',
    overflowX: 'auto',
    paddingTop: 0,
    marginTop: theme.spacing.unit * 2,
  },
  selecting: {
    maxHeight: '1000px',
    overflowX: 'auto',
  },
  table: {
    overflow: 'scroll',
  },
  stackscriptLabel: {
    width: 50,
  },
  tr: {
    height: 48,
  },
  tableHead: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.bg.offWhite,
    zIndex: 10,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sortable: {
    color: theme.palette.primary.main,
    fontWeight: 700,
    cursor: 'pointer',
  },
  sortButton: {
    marginLeft: -26,
    border: 0,
    width: '100%',
    justifyContent: 'flex-start',
  },
  sortIcon: {
    position: 'relative',
    top: 2,
    left: 10,
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
  currentFilterType: CurrentFilter | null;
  currentFilter: any; // @TODO type correctly
  isSorting: boolean;
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
    currentFilterType: null,
    currentFilter: { ['+order_by']: 'deployments_total', ['+order']: 'desc' },
    isSorting: false,
  };

  getDataAtPage = (page: number,
    filter: any = this.state.currentFilter,
    isSorting: boolean = false) => {
    const { request } = this.props;
    this.setState({ gettingMoreStackScripts: true, isSorting });

    request({ page, page_size: 50 }, filter)
      .then((response) => {
        if (!response.data.length) {
          this.setState({ showMoreButtonVisible: false });
        }
        const newData = (isSorting) ? response.data : [...this.state.data, ...response.data];
        this.setState({
          data: newData,
          gettingMoreStackScripts: false,
          loading: false,
          isSorting: false,
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
    this.getDataAtPage(1, { ['+order_by']: 'label', ['+order']: sortOrder }, true);
    this.setState({
      sortOrder: nextSortOrder,
      currentFilterType: 'label',
      currentFilter: { ['+order_by']: 'label', ['+order']: sortOrder },
    });
  }

  handleClickDeploymentsTableHeader = () => {
    const { sortOrder } = this.state;
    const nextSortOrder = (sortOrder === 'asc') ? 'desc' : 'asc';
    this.getDataAtPage(1, { ['+order_by']: 'deployments_active', ['+order']: sortOrder }, true);
    this.setState({
      sortOrder: nextSortOrder,
      currentFilterType: 'deploys',
      currentFilter: { ['+order_by']: 'deployments_active', ['+order']: sortOrder },
    });
  }

  handleClickRevisionsTableHeader = () => {
    const { sortOrder } = this.state;
    const nextSortOrder = (sortOrder === 'asc') ? 'desc' : 'asc';
    this.getDataAtPage(1, { ['+order_by']: 'updated', ['+order']: sortOrder }, true);
    this.setState({
      sortOrder: nextSortOrder,
      currentFilterType: 'revision',
      currentFilter: { ['+order_by']: 'updated', ['+order']: sortOrder },
    });
  }

  renderIcon = () => {
    const { sortOrder } = this.state;
    const { classes } = this.props;
    return (
      sortOrder === 'desc'
        ? <KeyboardArrowUp className={classes.sortIcon} />
        : <KeyboardArrowDown className={classes.sortIcon} />
    );
  }

  render() {
    const { classes } = this.props;
    const { currentFilterType, isSorting } = this.state;

    if (this.state.loading) {
      return <CircleProgress />;
    }

    return (
      <React.Fragment>
        <Table noOverflow={true} tableClass={classes.table}>
          <TableHead>
            <TableRow className={classes.tr}>
              <TableCell className={classNames({
                [classes.tableHead]: true,
                [classes.stackscriptLabel]: true,
              })} />
              <TableCell
                className={classNames({
                  [classes.tableHead]: true,
                  [classes.sortable]: true,
                })}
              >
                <Button
                  type="secondary"
                  className={classes.sortButton}
                  onClick={this.handleClickStackScriptsTableHeader}
                >
                  StackScripts
                  {currentFilterType === 'label' &&
                    this.renderIcon()
                  }
                </Button>
              </TableCell>
              <TableCell
                className={classNames({
                  [classes.tableHead]: true,
                  [classes.sortable]: true,
                })}
              >
                <Button
                  type="secondary"
                  className={classes.sortButton}
                  onClick={this.handleClickDeploymentsTableHeader}
                >
                  Active Deploys
                  {currentFilterType === 'deploys' &&
                    this.renderIcon()
                  }
                </Button>
              </TableCell>
              <TableCell
                className={classNames({
                  [classes.tableHead]: true,
                  [classes.sortable]: true,
                })}
              >
                <Button
                  type="secondary"
                  className={classes.sortButton}
                  onClick={this.handleClickRevisionsTableHeader}
                >
                  Last Revision
                  {currentFilterType === 'revision' &&
                    this.renderIcon()
                  }
                </Button>
              </TableCell>
              <TableCell className={classes.tableHead}>Compatible Images</TableCell>
            </TableRow>
          </TableHead>
          <StackScriptsSection
            isSorting={isSorting}
            onSelect={this.handleSelectStackScript}
            selectedId={this.state.selected}
            data={this.state.data}
            getNext={() => this.getNext()}
          />
        </Table>
        {this.state.showMoreButtonVisible && !isSorting &&
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

const styled = withStyles(styles, { withTheme: true });

const StyledContainer = styled(Container);

export default styled(RenderGuard<CombinedProps>(SelectStackScriptPanel));

import * as classNames from 'classnames';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import ErrorState from 'src/components/ErrorState';
import Notice from 'src/components/Notice';
import RenderGuard from 'src/components/RenderGuard';
import TabbedPanel from 'src/components/TabbedPanel';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import { deleteStackScript, getCommunityStackscripts, getStackScript, getStackScriptsByUser } from 'src/services/stackscripts';

import StackScriptsSection from './StackScriptsSection';

export interface ExtendedLinode extends Linode.Linode {
  heading: string;
  subHeadings: string[];
}

type SortOrder = 'asc' | 'desc';

type ClassNames = 'root'
  | 'creating'
  | 'selecting'
  | 'stackscriptLabel'
  | 'stackscriptTitles'
  | 'deploys'
  | 'revisions'
  | 'tr'
  | 'tableHead'
  | 'sortButton'
  | 'table'
  | 'emptyState';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 3,
  },
  creating: {
    height: 400,
    overflowX: 'auto',
    paddingTop: 0,
    marginTop: theme.spacing.unit * 2,
    overflowY: 'scroll',
    '-webkit-appearance': 'none',
  },
  selecting: {
    minHeight: '400px',
    maxHeight: '1000px',
    overflowX: 'auto',
    paddingTop: 0,
    marginTop: theme.spacing.unit * 2,
  },
  table: {
    overflow: 'scroll',
  },
  stackscriptLabel: {
    width: 84,
  },
  stackscriptTitles: {
    width: '30%',
  },
  deploys: {
    width: '20%',
  },
  revisions: {
    width: '20%',
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
  sortButton: {
    marginLeft: -26,
    border: 0,
    width: '100%',
    justifyContent: 'flex-start',
  },
  emptyState: {
    textAlign: 'center',
    padding: '10em',
  }
});

interface Props {
  selectedId: number | undefined;
  selectedUsername?: string;
  error?: string;
  shrinkPanel?: boolean;
  onSelect?: (id: number, label: string, username: string, images: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]) => void;
  publicImages: Linode.Image[];
  noHeader?: boolean;
  profile: Linode.Profile;
  resetSelectedStackScript?: () => void;
}

type StyledProps = Props & WithStyles<ClassNames>;

type CombinedProps = StyledProps;

interface State {
  shouldPreSelectStackScript: boolean;
}

class SelectStackScriptPanel extends React.Component<CombinedProps, State> {

  state: State = {
    shouldPreSelectStackScript: true,
  }

  tabs = [
    {
      title: 'My StackScripts',
      render: () => <StyledContainer
        onSelect={this.props.onSelect}
        publicImages={this.props.publicImages}
        currentUser={this.props.profile.username}
        request={getStackScriptsByUser}
        selectedStackScriptIDFromQuery={this.props.selectedId}
        shouldPreSelectStackScript={this.state.shouldPreSelectStackScript}
        key={0}
        resetStackScriptSelection={this.maybeResetStackScript}
      />,
    },
    {
      title: 'Linode StackScripts',
      render: () => <StyledContainer
        onSelect={this.props.onSelect}
        publicImages={this.props.publicImages}
        currentUser={this.props.profile.username}
        request={getStackScriptsByUser}
        selectedStackScriptIDFromQuery={this.props.selectedId}
        key={1}
        isLinodeStackScripts={true}
        shouldPreSelectStackScript={this.state.shouldPreSelectStackScript}
        resetStackScriptSelection={this.maybeResetStackScript}
      />,
    },
    {
      title: 'Community StackScripts',
      render: () => <StyledContainer
        onSelect={this.props.onSelect}
        publicImages={this.props.publicImages}
        currentUser={this.props.profile.username}
        request={getCommunityStackscripts}
        selectedStackScriptIDFromQuery={this.props.selectedId}
        shouldPreSelectStackScript={this.state.shouldPreSelectStackScript}
        resetStackScriptSelection={this.maybeResetStackScript}
        key={2}
      />,
    },
  ];

  myTabIndex = this.tabs.findIndex(tab => tab.title.toLowerCase().includes('my'));
  linodeTabIndex = this.tabs.findIndex(tab => tab.title.toLowerCase().includes('linode'));
  communityTabIndex = this.tabs.findIndex(tab => tab.title.toLowerCase().includes('community'));

  /*
  ** init tab needs to be set if we're being navigated from another page
  ** by means of a query string. The query string may looks similar to this:
  ** /linodes/create?type=fromStackScript&stackScriptID=9409&stackScriptUsername=clowwindy
  ** so we need a way to determined what tab the user should be on when
  ** seeing the panel. Default to 0 index if no query string
  */
  getInitTab = () => {
    const { profile, onSelect, selectedUsername } = this.props;

    if (profile.username === selectedUsername) {
      return this.myTabIndex;
    }
    if (selectedUsername === 'linode') {
      return this.linodeTabIndex;
    }
    if (selectedUsername !== ''
      && selectedUsername !== 'linode'
      && selectedUsername !== profile.username
      && !!onSelect) {
      return this.communityTabIndex;
    }
    return this.myTabIndex;
  }

  maybeResetStackScript = () => {
    const { resetSelectedStackScript } = this.props;
    if (resetSelectedStackScript) {
      resetSelectedStackScript();
    }
    return;
  }

  handleTabChange = () => {
    /*
    * if we're coming from a query string, the stackscript will be preselected
    * however, we don't want the user to have their stackscript still preselected
    * when they change StackScript tabs
    */
    this.setState({ shouldPreSelectStackScript: false });
    this.maybeResetStackScript();
  }

  render() {
    const { error, noHeader, shrinkPanel, classes } = this.props;

    return (
      <TabbedPanel
        error={error}
        rootClass={classes.root}
        shrinkTabContent={(shrinkPanel) ? classes.creating : classes.selecting}
        header={(noHeader) ? "" : "Select StackScript"}
        tabs={this.tabs}
        initTab={this.getInitTab()}
        handleTabChange={this.handleTabChange}
      />
    );
  }
}

interface Params {
  page?: number;
  page_size?: number;
}

interface ContainerProps {
  request: (username: string, params: Params, filter: any) =>
    Promise<Linode.ResourcePage<Linode.StackScript.Response>>;
  onSelect?: (id: number, label: string, username: string, images: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]) => void;
  currentUser: string;
  isLinodeStackScripts?: boolean;
  publicImages: Linode.Image[];
  selectedStackScriptIDFromQuery: number | undefined;
  shouldPreSelectStackScript: boolean;
  resetStackScriptSelection: () => void;
}

type CurrentFilter = 'label' | 'deploys' | 'revision';

interface Dialog {
  open: boolean;
  stackScriptID: number | undefined;
  stackScriptLabel: string;
}

interface ContainerState {
  currentPage: number;
  selected?: number;
  loading?: boolean;
  gettingMoreStackScripts: boolean;
  showMoreButtonVisible: boolean;
  listOfStackScripts: Linode.StackScript.Response[]; // @TODO type correctly
  sortOrder: SortOrder;
  currentFilterType: CurrentFilter | null;
  currentFilter: any; // @TODO type correctly
  isSorting: boolean;
  error?: Error;
  fieldError: Linode.ApiFieldError | undefined;
  dialog: Dialog;
}

type ContainerCombinedProps = ContainerProps & WithStyles<ClassNames>;

class Container extends React.Component<ContainerCombinedProps, ContainerState> {
  state: ContainerState = {
    selected: this.props.selectedStackScriptIDFromQuery || undefined,
    currentPage: 1,
    loading: true,
    gettingMoreStackScripts: false,
    listOfStackScripts: [],
    showMoreButtonVisible: true,
    sortOrder: 'asc',
    currentFilterType: null,
    currentFilter: { ['+order_by']: 'deployments_total', ['+order']: 'desc' },
    isSorting: false,
    error: undefined,
    fieldError: undefined,
    dialog: {
      open: false,
      stackScriptID: undefined,
      stackScriptLabel: '',
    }
  };

  mounted: boolean = false;

  getDataAtPage = (page: number,
    filter: any = this.state.currentFilter,
    isSorting: boolean = false) => {
    const { request, currentUser, isLinodeStackScripts, selectedStackScriptIDFromQuery } = this.props;
    this.setState({ gettingMoreStackScripts: true, isSorting });

    const filteredUser = (isLinodeStackScripts) ? 'linode' : currentUser;

    return request(
      filteredUser,
      { page, page_size: 50 },
      filter)
      .then((response: Linode.ResourcePage<Linode.StackScript.Response>) => {
        if (!this.mounted) { return; }

        if (!response.data.length || response.data.length === response.results) {
          this.setState({ showMoreButtonVisible: false });
        }

        /*
        * if we're sorting, just return the requested data, since we're
        * scrolling the user to the top and resetting the data
        */
        const newData = (isSorting) ? response.data : [...this.state.listOfStackScripts, ...response.data];

        /*
        * BEGIN @TODO: deprecate this once compound filtering becomes available in the API
        * basically, if the result set after filtering out StackScripts with
        * deprecated distos is 0, request the next page with the same filter.
        */
        const newDataWithoutDeprecatedDistros =
          newData.filter(stackScript => this.hasNonDeprecatedImages(stackScript.images));

        if (newDataWithoutDeprecatedDistros.length === 0) {
          this.getNext();
          return;
        }
        /*
        * END @TODO
        */

        /*
        * We need to further clean up the data because when we are preselecting
        * a stackscript based on the URL query string, it's possible for the
        * stackscript to appear again on the first page or any subsequent page
        * so we need to filter out that stackscript so we don't run into
        * the duplicate key error
        */
        const cleanedData = (!!selectedStackScriptIDFromQuery)
        ? newDataWithoutDeprecatedDistros.filter((stackScript, index) => {
          if(index !== 0) {
            return stackScript.id !== selectedStackScriptIDFromQuery;
          }
          return stackScript;
        })
        : newDataWithoutDeprecatedDistros;
        this.setState({
          listOfStackScripts: cleanedData,
          gettingMoreStackScripts: false,
          loading: false,
          isSorting: false,
        });
        return cleanedData;
      })
      .catch((e: any) => {
        if (!this.mounted) { return; }
        this.setState({ error: e.response });
      });
  }

  componentDidMount() {
    const { selectedStackScriptIDFromQuery, shouldPreSelectStackScript,
    onSelect } = this.props;
    this.mounted = true;
    /*
    * if the user is coming to the StackScripts panel from a query string
    * we need to first request the stackscript that's in the query string
    * and then prepend it to the first page request.
    * The only issue here is that we could end up with duplicate entries
    * in the list of data, but this is handled in getDataAtPage()
    */
    if (!!selectedStackScriptIDFromQuery && shouldPreSelectStackScript) {
      return getStackScript(selectedStackScriptIDFromQuery)
        .then(data => {
          this.setState({ listOfStackScripts: [data] });
          if (!!onSelect) {
            // preselect our stackscript here
            onSelect(data.id, data.label, data.username,
              data.images, data.user_defined_fields)
          }
          return data;
        })
        .then(data => {
          this.getDataAtPage(0)
        })
        .catch(e => {
          if (!this.mounted) { return; }
          this.props.resetStackScriptSelection();
          this.setState({error: e.response});
        });
    }
    return this.getDataAtPage(0);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getNext = () => {
    if (!this.mounted) { return; }
    this.setState(
      { currentPage: this.state.currentPage + 1 },
      () => this.getDataAtPage(this.state.currentPage, this.state.currentFilter, this.state.isSorting),
    );
  }

  hasNonDeprecatedImages = (stackScriptImages: string[]) => {
    const { publicImages } = this.props;
    for (const stackScriptImage of stackScriptImages) {
      for (const publicImage of publicImages) {
        if (stackScriptImage === publicImage.id) {
          return true;
        }
      }
    }
    return false;
  }

  handleSelectStackScript = (stackscript: Linode.StackScript.Response) => {
    if (!this.props.onSelect) { return; }
    this.props.onSelect(
      stackscript.id,
      stackscript.label,
      stackscript.username,
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

  handleOpenDialog = (id: number, label: string) => {
    this.setState({
      dialog: {
        open: true,
        stackScriptID: id,
        stackScriptLabel: label,
      }
    })
  }

  handleCloseDialog = () => {
    this.setState({
      dialog: {
        open: false,
        stackScriptID: undefined,
        stackScriptLabel: '',
      }
    })
  }

  handleDeleteStackScript = () => {
    deleteStackScript(this.state.dialog.stackScriptID!)
      .then(response => {
        this.setState({
          dialog: {
            open: false,
            stackScriptID: undefined,
            stackScriptLabel: '',
          }
        });
        this.getDataAtPage(1, this.state.currentFilter, true);
      })
      .catch(e => {
        this.setState({
          dialog: {
            open: false,
            stackScriptID: undefined,
            stackScriptLabel: '',
          },
          fieldError: {
            reason: 'Unable to complete your request at this time'
          }
        })
      });
  }

  renderDialogActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button
            variant="raised"
            type="secondary"
            destructive
            onClick={this.handleDeleteStackScript}>
            Yes
          </Button>
          <Button
            variant="raised"
            type="secondary"
            className="cancel"
            onClick={this.handleCloseDialog}
          >
            No
          </Button>
        </ActionsPanel>
      </React.Fragment>
    )
  }

  renderDeleteStackScriptDialog = () => {
    const { dialog } = this.state;

    return (
      <ConfirmationDialog
        title={`Delete ${dialog.stackScriptLabel}?`}
        open={dialog.open}
        actions={this.renderDialogActions}
        onClose={this.handleCloseDialog}
      >
        <Typography>Are you sure you want to delete this StackScript?</Typography>
      </ConfirmationDialog>
    )
  }

  renderIcon = () => {
    const { sortOrder } = this.state;

    return (
      sortOrder === 'desc'
        ? <KeyboardArrowUp className="sortIcon" />
        : <KeyboardArrowDown className="sortIcon" />
    );
  }

  render() {
    const { classes, publicImages, currentUser } = this.props;
    const { currentFilterType, isSorting, fieldError, error } = this.state;

    if(error) {
      return <ErrorState
        errorText="There was an error loading your StackScripts. Please try again later."
      />
    }

    if (this.state.loading) {
      return <CircleProgress noTopMargin />;
    }

    const selectProps = (!!this.props.onSelect)
      ? { onSelect: this.handleSelectStackScript }
      : {}

    return (
      <React.Fragment>
        {fieldError && fieldError.reason &&
          <Notice text={fieldError.reason} error />
        }
        {this.state.listOfStackScripts.length === 0
        ? <div className={classes.emptyState} data-qa-stackscript-empty-msg>
          You do not have any StackScripts to select from. You must first
          <Link to="/stackscripts/create"> create one</Link>
        </div>
        : <Table noOverflow={true} tableClass={classes.table}>
          <TableHead>
            <TableRow className={classes.tr}>
              {!!this.props.onSelect &&
                <TableCell className={classNames({
                  [classes.tableHead]: true,
                  [classes.stackscriptLabel]: true,
                })} />
              }
              <TableCell
                className={classNames({
                  [classes.tableHead]: true,
                  [classes.stackscriptTitles]: true,
                })}
                sortable
              >
                <Button
                  type="secondary"
                  className={classes.sortButton}
                  onClick={this.handleClickStackScriptsTableHeader}
                  data-qa-stackscript-table-header
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
                  [classes.deploys]: true,
                })}
                noWrap
                sortable
              >
                <Button
                  type="secondary"
                  className={classes.sortButton}
                  onClick={this.handleClickDeploymentsTableHeader}
                  data-qa-stackscript-active-deploy-header
                >
                  Active Deploys
                  {currentFilterType !== 'label' && currentFilterType !== 'revision' &&
                    this.renderIcon()
                  }
                </Button>
              </TableCell>
              <TableCell
                className={classNames({
                  [classes.tableHead]: true,
                  [classes.revisions]: true,
                })}
                noWrap
                sortable
              >
                <Button
                  type="secondary"
                  className={classes.sortButton}
                  onClick={this.handleClickRevisionsTableHeader}
                  data-qa-stackscript-revision-header
                >
                  Last Revision
                  {currentFilterType === 'revision' &&
                    this.renderIcon()
                  }
                </Button>
              </TableCell>
              <TableCell
                className={classes.tableHead}
                data-qa-stackscript-compatible-images
              >
                Compatible Images
              </TableCell>
              {!this.props.onSelect &&
                <TableCell className={classNames({
                  [classes.tableHead]: true,
                  [classes.stackscriptLabel]: true,
                })} />
              }
            </TableRow>
          </TableHead>
          <StackScriptsSection
            isSorting={isSorting}
            selectedId={this.state.selected}
            data={this.state.listOfStackScripts}
            publicImages={publicImages}
            triggerDelete={this.handleOpenDialog}
            currentUser={currentUser}
            {...selectProps}
          />
        </Table>
        }
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
        {this.renderDeleteStackScriptDialog()}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: Linode.AppState) => ({
  profile: pathOr({}, ['resources', 'profile', 'data'], state),
});

const styled = withStyles(styles, { withTheme: true });

const StyledContainer = styled(Container);

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  connect(mapStateToProps),
  RenderGuard,
  styled,
)(SelectStackScriptPanel);

import * as React from 'react';
import { Link } from 'react-router-dom';
import Waypoint from 'react-waypoint';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DebouncedSearch from 'src/components/DebouncedSearchTextField';
import ErrorState from 'src/components/ErrorState';
import Notice from 'src/components/Notice';
import Table from 'src/components/Table';
import { deleteStackScript, updateStackScript } from 'src/services/stackscripts';
import { sendEvent } from 'src/utilities/analytics';
import StackScriptTableHead from './PanelContent/StackScriptTableHead';
import StackScriptsSection from './StackScriptsSection';

type ClassNames = 'root'
  | 'emptyState'
  | 'table'
  | 'searchWrapper'
  | 'searchBar';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  table: {
    overflow: 'scroll',
  },
  emptyState: {
    textAlign: 'center',
    padding: '5em 2em',
    [theme.breakpoints.up('sm')]: {
      padding: '10em',
    },
  },
  searchWrapper: {
    position: 'sticky',
    width: '100%',
    top: 0,
    zIndex: 11,
    paddingBottom: theme.spacing.unit * 3,
    backgroundColor: theme.bg.white,
  },
  searchBar: {
    marginTop: 0,
    backgroundColor: theme.color.white,
  },
});

interface Props {
  request: (username: string, params: Params, filter: any) =>
    Promise<Linode.ResourcePage<Linode.StackScript.Response>>;
  currentUser: string;
  category: 'my' | 'account' | 'linode' | 'community';
  publicImages: Linode.Image[];
}

type CurrentFilter = 'label' | 'deploys' | 'revision';

interface DialogVariantProps {
  open: boolean;
}
interface Dialog {
  makePublic: DialogVariantProps,
  delete: DialogVariantProps,
  stackScriptID: number | undefined;
  stackScriptLabel: string;
}

interface Params {
  page?: number;
  page_size?: number;
}

type APIFilters = 'label'
| 'deployments_active'
| 'updated'

interface FilterInfo {
  apiFilter: APIFilters | null;
  currentFilter: CurrentFilter | null;
}

type SortOrder = 'asc' | 'desc';

type AcceptedFilters = 'username' | 'description' | 'label'

interface State {
  currentPage: number;
  loading?: boolean;
  gettingMoreStackScripts: boolean;
  allStackScriptsLoaded: boolean;
  getMoreStackScriptsFailed: boolean; // did our attempt to get the next page of stackscripts fail?
  listOfStackScripts: Linode.StackScript.Response[]; // @TODO type correctly
  sortOrder: SortOrder;
  currentFilterType: CurrentFilter | null;
  currentFilter: any; // @TODO type correctly
  currentSearchFilter: any;
  isSorting: boolean;
  error?: Error;
  fieldError: Linode.ApiFieldError | undefined;
  dialog: Dialog;
  isSearching: boolean;
  didSearch: boolean;
  successMessage: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class StackScriptPanelContent extends React.Component<CombinedProps, State> {
  state: State = {
    currentPage: 1,
    loading: true,
    gettingMoreStackScripts: false,
    listOfStackScripts: [],
    allStackScriptsLoaded: false,
    getMoreStackScriptsFailed: false,
    sortOrder: 'asc',
    currentFilterType: null,
    currentFilter: { ['+order_by']: 'deployments_active', ['+order']: 'desc' },
    currentSearchFilter: {},
    isSorting: false,
    error: undefined,
    fieldError: undefined,
    dialog: {
      makePublic: {
        open: false,
      },
      delete: {
        open: false,
      },
      stackScriptID: undefined,
      stackScriptLabel: '',
    },
    isSearching: false,
    didSearch: false,
    successMessage: '',
  };

  mounted: boolean = false;

  getDataAtPage = (page: number,
    filter: any = this.state.currentFilter,
    isSorting: boolean = false) => {
    const { request, currentUser, category } = this.props;
    this.setState({ gettingMoreStackScripts: true, isSorting });

    const filteredUser = (category === 'linode') ? 'linode' : currentUser;

    return request(
      filteredUser,
      { page, page_size: 50 },
      filter)
      .then((response: Linode.ResourcePage<Linode.StackScript.Response>) => {
        if (!this.mounted) { return; }

        /*
        * if we have no results at all or if we've loaded all available results
        */
        if (!response.data.length || response.data.length === response.results) {
          this.setState({ allStackScriptsLoaded: true });
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

        // we have to make sure both the original data set
        // AND the filtered data set is 0 before we request the next page automatically
        if (isSorting
          && (newData.length !== 0
            && newDataWithoutDeprecatedDistros.length === 0)) {
          this.getNext();
          return;
        }

        this.setState({
          listOfStackScripts: newDataWithoutDeprecatedDistros,
          gettingMoreStackScripts: false,
          loading: false,
          isSorting: false,
          getMoreStackScriptsFailed: false,
        });
        return newDataWithoutDeprecatedDistros;
      })
      .catch((e: any) => {
        if (!this.mounted) { return; }
        if (page > 1) { this.setState({ getMoreStackScriptsFailed: true }) }
        this.setState({ error: e.response, loading: false, gettingMoreStackScripts: false });
      });
  }

  componentDidMount() {
    this.mounted = true;
    return this.getDataAtPage(0);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getNext = (e?: any) => {
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

  generateFilterInfo = (value: CurrentFilter): FilterInfo => {
    switch (value) {
      case 'label':
        return {
          apiFilter: 'label',
          currentFilter: 'label',
        }
      case 'deploys':
        return {
          apiFilter: 'deployments_active',
          currentFilter: 'deploys',
        }
      case 'revision':
        return {
          apiFilter: 'updated',
          currentFilter: 'revision'
        }
      default:
        return {
          apiFilter: null,
          currentFilter: null,
        }
    }
  }

  handleClickTableHeader= (value: string) => {
    const { currentSearchFilter, sortOrder } = this.state;

    const nextSortOrder = (sortOrder === 'asc') ? 'desc' : 'asc';
    const targetFilter = value as CurrentFilter;
    const filterInfo = this.generateFilterInfo(targetFilter);

    /*
    * If a search filter is applied, persist the search terms
    * when we sort the table results
    */
    const filterWithSearch = (!!Object.keys(currentSearchFilter).length)
      ? { ['+order_by']: filterInfo.apiFilter, ['+order']: sortOrder, ...currentSearchFilter }
      : { ['+order_by']: filterInfo.apiFilter, ['+order']: sortOrder }

    this.getDataAtPage(1, filterWithSearch, true);
    this.setState({
      sortOrder: nextSortOrder,
      currentFilterType: filterInfo.currentFilter,
      currentFilter: { ['+order_by']: filterInfo.apiFilter, ['+order']: sortOrder },
    });
  }

  handleOpenDeleteDialog = (id: number, label: string) => {
    this.setState({
      dialog: {
        delete: {
          open: true,
        },
        makePublic: {
          open: false,
        },
        stackScriptID: id,
        stackScriptLabel: label,
      }
    })
  }

  handleOpenMakePublicDialog = (id: number, label: string) => {
    this.setState({
      dialog: {
        delete: {
          open: false,
        },
        makePublic: {
          open: true,
        },
        stackScriptID: id,
        stackScriptLabel: label,
      }
    })
  }

  handleCloseDialog = () => {
    this.setState({
      dialog: {
        ...this.state.dialog,
        delete: {
          open: false,
        },
        makePublic: {
          open: false,
        },
      }
    })
  }

  handleDeleteStackScript = () => {
    deleteStackScript(this.state.dialog.stackScriptID!)
      .then(response => {
        this.setState({
          dialog: {
            delete: {
              open: false,
            },
            makePublic: {
              open: false,
            },
            stackScriptID: undefined,
            stackScriptLabel: '',
          }
        });
        this.getDataAtPage(1, this.state.currentFilter, true);
      })
      .catch(e => {
        this.setState({
          dialog: {
            delete: {
              open: false,
            },
            makePublic: {
              open: false,
            },
            stackScriptID: undefined,
            stackScriptLabel: '',
          },
          fieldError: {
            reason: 'Unable to complete your request at this time'
          }
        })
      });
  }

  handleMakePublic = () => {
    const { dialog, currentFilter } = this.state;

    updateStackScript(dialog.stackScriptID!, { is_public: true })
      .then(response => {
        if (!this.mounted) { return; }
        this.setState({
          successMessage: `${dialog.stackScriptLabel} successfully published to the public library`,
          dialog: {
            delete: {
              open: false,
            },
            makePublic: {
              open: false,
            },
            stackScriptID: undefined,
            stackScriptLabel: '',
          }
        });
        this.getDataAtPage(1, currentFilter, true);
      })
      .catch(e => {
        this.setState({
          dialog: {
            delete: {
              open: false,
            },
            makePublic: {
              open: false,
            },
            stackScriptID: undefined,
            stackScriptLabel: '',
          },
          fieldError: {
            reason: 'Unable to complete your request at this time'
          }
        })
      });
  }


  renderConfirmMakePublicActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button
            type="cancel"
            onClick={this.handleCloseDialog}
          >
            Cancel
          </Button>
          <Button
            type="secondary"
            destructive
            onClick={this.handleMakePublic}>
            Yes, make me a star!
          </Button>
        </ActionsPanel>
      </React.Fragment>
    )
  }

  renderConfirmDeleteActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button
            type="cancel"
            onClick={this.handleCloseDialog}
          >
            Cancel
          </Button>
          <Button
            type="secondary"
            destructive
            onClick={this.handleDeleteStackScript}>
            Delete
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
        open={dialog.delete.open}
        actions={this.renderConfirmDeleteActions}
        onClose={this.handleCloseDialog}
      >
        <Typography>
          Are you sure you want to delete this StackScript?
        </Typography>
      </ConfirmationDialog>
    )
  }

  renderMakePublicDialog = () => {
    const { dialog } = this.state;

    return (
      <ConfirmationDialog
        title={`Woah, just a word of caution...`}
        open={dialog.makePublic.open}
        actions={this.renderConfirmMakePublicActions}
        onClose={this.handleCloseDialog}
      >
        <Typography>
          Are you sure you want to make {dialog.stackScriptLabel} public?
          This action cannot be undone, nor will you be able to delete the StackScript once
          made available to the public.
        </Typography>
      </ConfirmationDialog>
    )
  }

  handleSearch = (value: string) => {
    const {
      request,
      currentUser,
      category
    } = this.props;
    const { currentFilter } = this.state;
    const filteredUser = (category === 'linode') ? 'linode' : currentUser;

    const lowerCaseValue = value.toLowerCase().trim();

    let filter: any;

    /**
     * only allow for advanced search if we're on the community
     * stackscripts tab
     */
    if (category === 'community' &&
      (
        lowerCaseValue.includes('username:')
      || lowerCaseValue.includes('label:')
        || lowerCaseValue.includes('description:'))
    ) {
      /**
       * In this case, we have a search term that looks similar to the
       * following: "username:hello world"
       *
       * In this case, we need to craft the filter so that the request is
       * aware that we only want to search by username
       */

      const indexOfColon = lowerCaseValue.indexOf(':');
      // everything before the colon is what we want to filter by
      const filterKey = lowerCaseValue.substr(0, indexOfColon);
      // everything after the colon is the term we want to search for
      const searchTerm = lowerCaseValue.substr(indexOfColon + 1);
      filter = generateSpecificFilter(filterKey as AcceptedFilters, searchTerm)
    } else {
      /**
       * Otherwise, just generate a catch-all filter for
       * username, description, and label
       */
      filter = generateCatchAllFilter(lowerCaseValue)
    }

    this.setState({
      isSearching: true, // wether to show the loading spinner in search bar
      didSearch: true, // table will show default empty state unless didSearch is true
    });

    sendEvent({
      category: 'stackscripts',
      action: 'search',
      label: lowerCaseValue
    });

    request(
      filteredUser,
      { page: 1, page_size: 50 },
      { ...filter, ...currentFilter }
    )
      .then((response) => {
        if (!this.mounted) { return; }
        this.setState({ listOfStackScripts: response.data, isSearching: false });
        /*
        * If we're searching for search result, prevent the user
        * from loading more stackscripts
        */
        if (value) {
          this.setState({
            allStackScriptsLoaded: true,
            currentSearchFilter: filter,
           });
        } else {
          this.setState({
            allStackScriptsLoaded: false,
            currentSearchFilter: [],
          });
        }
      })
      .catch(e => {
        if (!this.mounted) { return; }
        this.setState({ error: e, isSearching: false })
      });
  }

  render() {
    const { classes, publicImages, currentUser } = this.props;
    const {
      currentFilterType,
      isSorting,
      error,
      fieldError,
      isSearching,
      listOfStackScripts,
      didSearch,
      successMessage,
      sortOrder,
      allStackScriptsLoaded,
      gettingMoreStackScripts,
      getMoreStackScriptsFailed,
    } = this.state;

    if(error) {
      return (
        <div style={{ overflow: 'hidden' }}>
          <ErrorState
            errorText="There was an error loading your StackScripts. Please try again later."
          />
        </div>
      )
    }

    if (this.state.loading) {
      return <CircleProgress noTopMargin />;
    }

    return (
      <React.Fragment>
        {fieldError && fieldError.reason &&
          <Notice text={fieldError.reason} error />
        }
        {successMessage &&
          <Notice text={successMessage} success />
        }
        {/*
        * We only want to show this empty state on the initial GET StackScripts request
        * If the user is searching and 0 results come back, we just want to show
        * an empty table, rather than showing a message indicating no StackScripts exist
        */}
        {!didSearch && listOfStackScripts.length === 0
          ? <div className={classes.emptyState} data-qa-stackscript-empty-msg>
            You do not have any StackScripts to select from. You must first
          <Link to="/stackscripts/create"> create one.</Link>
          </div>
          : <React.Fragment>
            <div className={classes.searchWrapper}>
              <DebouncedSearch
                placeholderText='Search by Label, Username, or Description'
                onSearch={this.handleSearch}
                className={classes.searchBar}
                isSearching={isSearching}
                /** uncomment when we upgrade to MUI v3 */
                // toolTipText={`Hint: try searching for a specific item by prepending your
                // search term with "username:", "label:", or "description:"`}
              />
            </div>
            <Table
              isResponsive={false}
              aria-label="List of StackScripts"
              noOverflow={true}
              tableClass={classes.table}>
              <StackScriptTableHead
                handleClickTableHeader={this.handleClickTableHeader}
                sortOrder={sortOrder}
                currentFilterType={currentFilterType}
              />
              <StackScriptsSection
                isSorting={isSorting}
                data={this.state.listOfStackScripts}
                publicImages={publicImages}
                triggerDelete={this.handleOpenDeleteDialog}
                triggerMakePublic={this.handleOpenMakePublicDialog}
                currentUser={currentUser}
              />
            </Table>
            {/*
            * show loading indicator if we're getting more stackscripts
            * and if we're not showing the "get more stackscripts" button
            */}
            {gettingMoreStackScripts && !isSorting &&
              <div style={{ margin: '32px 0 32px 0', textAlign: 'center' }}><CircleProgress mini /></div>
            }
          </React.Fragment>
        }
        {/*
        * if we're sorting, or if we already loaded all results
        * or if we're in the middle of getting more results, don't render
        * the lazy load trigger
        */}
        {!isSorting && !allStackScriptsLoaded && !gettingMoreStackScripts &&
          <div style={{ textAlign: 'center' }}>
            {/*
            * If the lazy-load failed (marked by the catch in getNext),
            * show the "Show more StackScripts button
            * Otherwise, try to lazy load some more dang stackscripts
            */}
            {(!getMoreStackScriptsFailed)
              ? <Waypoint
                onEnter={this.getNext}
              >
                {/*
                * The reason for this empty div is that there was some wonkiness when
                * scrolling to the waypoint with trackpads. For some reason, the Waypoint
                * would never be scrolled into view no matter how much you scrolled on the
                * trackpad. Especially finicky at zoomed in browser sizes
                */}
                <div style={{ minHeight: '150px' }} />
              </Waypoint>
              : <Button
                title="Show More StackScripts"
                onClick={this.getNext}
                value="Show More"
                type="secondary"
                disabled={this.state.gettingMoreStackScripts}
                style={{ margin: '32px 0 32px 0' }}
              >
                Show More StackScripts
              </Button>
            }
          </div>
        }
        {this.renderDeleteStackScriptDialog()}
        {this.renderMakePublicDialog()}
      </React.Fragment>
    );
  }
}

const generateSpecificFilter = (
  key: AcceptedFilters,
  searchTerm: string
) => {
  return {
    [key]: {
      ["+contains"]: searchTerm
    }
  }
}

const generateCatchAllFilter = (searchTerm: string) => {
  return {
    ["+or"]: [
      {
        "label": {
          ["+contains"]: searchTerm
        },
      },
      {
        "username": {
          ["+contains"]: searchTerm
        },
      },
      {
        "description": {
          ["+contains"]: searchTerm
        },
      },
    ],
  };
}

const styled = withStyles(styles);

export default styled(StackScriptPanelContent);

import { Image } from '@linode/api-v4/lib/images';
import { StackScript } from '@linode/api-v4/lib/stackscripts';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import classNames from 'classnames';
import { stringify } from 'qs';
import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Waypoint } from 'react-waypoint';
import { compose } from 'recompose';
import StackScriptsIcon from 'src/assets/icons/entityIcons/stackscript.svg';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Typography from 'src/components/core/Typography';
import DebouncedSearch from 'src/components/DebouncedSearchTextField';
import ErrorState from 'src/components/ErrorState';
import Notice from 'src/components/Notice';
import Placeholder from 'src/components/Placeholder';
import Table from 'src/components/Table';
import withProfile, { ProfileProps } from 'src/components/withProfile';
import { hasGrant } from 'src/features/Profile/permissionsHelpers';
import { isLinodeKubeImageId } from 'src/store/image/image.helpers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { sendStackscriptsSearchEvent } from 'src/utilities/ga';
import { getDisplayName } from 'src/utilities/getDisplayName';
import { handleUnauthorizedErrors } from 'src/utilities/handleUnauthorizedErrors';
import { getQueryParam } from 'src/utilities/queryParams';
import StackScriptTableHead from '../Partials/StackScriptTableHead';
import {
  AcceptedFilters,
  generateCatchAllFilter,
  generateSpecificFilter,
} from '../stackScriptUtils';
import { StackScriptsRequest } from '../types';
import withStyles, { StyleProps } from './StackScriptBase.styles';

type CurrentFilter = 'label' | 'deploys' | 'revision';

type SortOrder = 'asc' | 'desc';

type APIFilters = 'label' | 'deployments_total' | 'updated';

interface FilterInfo {
  apiFilter: APIFilters | null;
  currentFilter: CurrentFilter | null;
}

export interface State {
  currentPage: number;
  loading?: boolean;
  gettingMoreStackScripts: boolean;
  allStackScriptsLoaded: boolean;
  getMoreStackScriptsFailed: boolean; // did our attempt to get the next page of stackscripts fail?
  listOfStackScripts: StackScript[];
  sortOrder: SortOrder;
  currentFilterType: CurrentFilter | null;
  currentFilter: any; // @TODO type correctly
  currentSearchFilter: any;
  isSorting: boolean;
  error?: APIError[];
  fieldError: APIError | undefined;
  isSearching: boolean;
  didSearch: boolean;
  successMessage: string;
}

type CombinedProps = StyleProps &
  RouteComponentProps &
  ProfileProps & {
    publicImages: Record<string, Image>;
    category: string;
    request: StackScriptsRequest;
  };

interface HelperFunctions {
  getDataAtPage: (page: number, filter?: any, isSorting?: boolean) => any;
  getNext: () => void;
}

export type StateProps = HelperFunctions & State;

interface WithStackScriptBaseOptions {
  isSelecting: boolean;
  // Whether or not `type=` and `query=` QS params should be respected and
  // written to on user input.
  useQueryString?: boolean;
}

/* tslint:disable-next-line */
const withStackScriptBase = (options: WithStackScriptBaseOptions) => (
  Component: React.ComponentType<StateProps>
) => {
  const { isSelecting, useQueryString } = options;

  class EnhancedComponent extends React.Component<CombinedProps, State> {
    static displayName = `WithStackScriptBase(${getDisplayName(Component)})`;

    mounted: boolean = false;

    state: State = {
      currentPage: 1,
      loading: true,
      gettingMoreStackScripts: false,
      listOfStackScripts: [],
      allStackScriptsLoaded: false,
      getMoreStackScriptsFailed: false,
      sortOrder: 'asc',
      currentFilterType: null,
      currentFilter: {
        ['+order_by']: 'deployments_total',
        ['+order']: 'desc',
      },
      currentSearchFilter: {},
      isSorting: false,
      error: undefined,
      fieldError: undefined,
      isSearching: false,
      didSearch: false,
      successMessage: '',
    };

    componentDidMount() {
      this.mounted = true;
      // If the URL contains a QS param called "query" treat it as a filter.
      const query = getQueryParam(this.props.location.search, 'query');
      if (query) {
        return this.handleSearch(query);
      }

      return this.getDataAtPage(1);
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    getDataAtPage = (
      page: number,
      filter: any = this.state.currentFilter,
      isSorting: boolean = false
    ) => {
      const { request, category } = this.props;
      this.setState({
        gettingMoreStackScripts: true,
        isSorting,
        currentPage: page,
      });

      return request({ page, page_size: 25 }, filter)
        .then((response: ResourcePage<StackScript>) => {
          if (!this.mounted) {
            return;
          }

          /*
           * if we have no results at all or if we've loaded all available results
           */
          if (
            !response.data.length ||
            response.data.length === response.results
          ) {
            this.setState({ allStackScriptsLoaded: true });
          }

          /*
           * if we're sorting, just return the requested data, since we're
           * scrolling the user to the top and resetting the data
           */
          const newData = isSorting
            ? response.data
            : [...this.state.listOfStackScripts, ...response.data];

          /**
           * - When viewing Community StackScripts, we want to filter out
           *   StackScripts that are not deployable (has no non-deprecated images).
           * - When viewing Account StackScripts, we want users to be able to see
           *   StackScripts with deprecated images so they can view and edit them.
           * - We will always filter out LKE images to prevent confusion for the user.
           */
          const stackScriptFilter =
            category === 'community'
              ? (stackScript: StackScript) =>
                  this.hasNonDeprecatedImages(stackScript.images) &&
                  !this.usesKubeImage(stackScript.images)
              : (stackScript: StackScript) =>
                  !this.usesKubeImage(stackScript.images);

          const filteredData = newData.filter(stackScriptFilter);

          // we have to make sure both the original data set
          // AND the filtered data set is 0 before we request the next page automatically
          if (isSorting && newData.length !== 0 && filteredData.length === 0) {
            this.getNext();
            return;
          }
          this.setState({
            listOfStackScripts: filteredData,
            gettingMoreStackScripts: false,
            loading: false,
            isSorting: false,
            getMoreStackScriptsFailed: false,
          });
          return filteredData;
        })
        .catch((e: any) => {
          if (!this.mounted) {
            return;
          }
          if (page > 1) {
            this.setState({ getMoreStackScriptsFailed: true });
          }
          this.setState({
            error: getAPIErrorOrDefault(
              e,
              'There was an error loading StackScripts'
            ),
            loading: false,
            gettingMoreStackScripts: false,
          });
        });
    };

    getNext = () => {
      if (!this.mounted) {
        return;
      }
      this.setState({ currentPage: this.state.currentPage + 1 }, () =>
        this.getDataAtPage(
          this.state.currentPage,
          this.state.currentFilter,
          this.state.isSorting
        )
      );
    };

    hasNonDeprecatedImages = (stackScriptImages: string[]) => {
      const { publicImages } = this.props;
      for (const stackScriptImage of stackScriptImages) {
        if (publicImages[stackScriptImage]) {
          return true;
        }
      }
      return false;
    };

    usesKubeImage = (stackScriptImages: string[]) =>
      stackScriptImages.some((imageId) => isLinodeKubeImageId(imageId));

    generateFilterInfo = (value: CurrentFilter): FilterInfo => {
      switch (value) {
        case 'label':
          return {
            apiFilter: 'label',
            currentFilter: 'label',
          };
        case 'deploys':
          return {
            apiFilter: 'deployments_total',
            currentFilter: 'deploys',
          };
        case 'revision':
          return {
            apiFilter: 'updated',
            currentFilter: 'revision',
          };
        default:
          return {
            apiFilter: null,
            currentFilter: null,
          };
      }
    };

    handleClickTableHeader = (value: string) => {
      const { currentSearchFilter, sortOrder } = this.state;

      const nextSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      const targetFilter = value as CurrentFilter;
      const filterInfo = this.generateFilterInfo(targetFilter);

      /*
       * If a search filter is applied, persist the search terms
       * when we sort the table results
       */
      const filterWithSearch = !!Object.keys(currentSearchFilter).length
        ? {
            ['+order_by']: filterInfo.apiFilter,
            ['+order']: sortOrder,
            ...currentSearchFilter,
          }
        : { ['+order_by']: filterInfo.apiFilter, ['+order']: sortOrder };

      this.getDataAtPage(1, filterWithSearch, true);
      this.setState({
        currentPage: 1,
        sortOrder: nextSortOrder,
        currentFilterType: filterInfo.currentFilter,
        currentFilter: {
          ['+order_by']: filterInfo.apiFilter,
          ['+order']: sortOrder,
        },
      });
    };

    goToCreateStackScript = () => {
      const { history } = this.props;
      history.push('/stackscripts/create');
    };

    handleSearch = (value: string) => {
      const { currentFilter } = this.state;
      const { category, request, history } = this.props;

      const lowerCaseValue = value.toLowerCase().trim();

      // Update the Query String as the user types.
      if (useQueryString) {
        updateQueryString(lowerCaseValue, history);
      }

      let filter: any;

      /**
       * only allow for advanced search if we're on the community
       * stackscripts tab
       */
      if (
        category === 'community' &&
        (lowerCaseValue.includes('username:') ||
          lowerCaseValue.includes('label:') ||
          lowerCaseValue.includes('description:'))
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
        filter = generateSpecificFilter(
          filterKey as AcceptedFilters,
          searchTerm
        );
      } else {
        /**
         * Otherwise, just generate a catch-all filter for
         * username, description, and label
         */
        filter = generateCatchAllFilter(lowerCaseValue);
      }

      this.setState({
        isSearching: true, // wether to show the loading spinner in search bar
        didSearch: true, // table will show default empty state unless didSearch is true
      });

      sendStackscriptsSearchEvent(lowerCaseValue);

      request({ page: 1, page_size: 50 }, { ...filter, ...currentFilter })
        .then((response: any) => {
          if (!this.mounted) {
            return;
          }
          this.setState({
            listOfStackScripts: response.data,
            isSearching: false,
            loading: false,
          });
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
        .catch((e: any) => {
          if (!this.mounted) {
            return;
          }
          this.setState({
            error: getAPIErrorOrDefault(
              e,
              'There was an error loading StackScripts'
            ),
            isSearching: false,
            loading: false,
          });
        });
    };

    render() {
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

      const { classes, profile, grants } = this.props;

      const userCannotCreateStackScripts =
        Boolean(profile.data?.restricted) &&
        !hasGrant('add_stackscripts', grants.data);

      if (error) {
        return (
          <div style={{ overflow: 'hidden' }}>
            <ErrorState
              errorText={pathOr(
                'There was an error.',
                [0, 'reason'],
                handleUnauthorizedErrors(
                  error,
                  'You are not authorized to view StackScripts for this account.'
                )
              )}
            />
          </div>
        );
      }

      if (this.state.loading) {
        return (
          <div className={classes.loaderWrapper}>
            <CircleProgress />
          </div>
        );
      }

      // Use the query string if the argument has been specified.
      const query = useQueryString
        ? getQueryParam(this.props.location.search, 'query')
        : undefined;

      return (
        <React.Fragment>
          {fieldError && fieldError.reason && (
            <Notice text={fieldError.reason} error />
          )}
          {successMessage && <Notice text={successMessage} success />}
          {/*
           * We only want to show this empty state on the initial GET StackScripts request
           * If the user is searching and 0 results come back, we just want to show
           * an empty table, rather than showing a message indicating no StackScripts exist
           */}
          {!didSearch &&
          listOfStackScripts &&
          listOfStackScripts.length === 0 ? (
            <div className={classes.emptyState} data-qa-stackscript-empty-msg>
              {userCannotCreateStackScripts ? (
                <Placeholder
                  icon={StackScriptsIcon}
                  isEntity
                  renderAsSecondary
                  title="StackScripts"
                  className={classes.stackscriptPlaceholder}
                >
                  You don&rsquo;t have any StackScripts to select from.
                </Placeholder>
              ) : (
                <Placeholder
                  icon={StackScriptsIcon}
                  renderAsSecondary
                  isEntity
                  title="StackScripts"
                  buttonProps={[
                    {
                      children: 'Create StackScript',
                      onClick: () => this.goToCreateStackScript(),
                    },
                  ]}
                  className={classes.stackscriptPlaceholder}
                >
                  <Typography variant="subtitle1">
                    Automate Deployment with StackScripts!
                  </Typography>
                  <Typography variant="subtitle1">
                    <a
                      href="https://linode.com/docs/platform/stackscripts-new-manager/"
                      target="_blank"
                      aria-describedby="external-site"
                      rel="noopener noreferrer"
                      className="h-u"
                    >
                      Learn more about getting started
                    </a>
                    &nbsp;or&nbsp;
                    <a
                      href="https://www.linode.com/docs/"
                      target="_blank"
                      aria-describedby="external-site"
                      rel="noopener noreferrer"
                      className="h-u"
                    >
                      visit our guides and tutorials.
                    </a>
                  </Typography>
                </Placeholder>
              )}
            </div>
          ) : (
            <React.Fragment>
              <div
                className={classNames({
                  [classes.searchWrapper]: true,
                  [classes.landing]: !isSelecting,
                })}
              >
                <DebouncedSearch
                  placeholder="Search by Label, Username, or Description"
                  onSearch={this.handleSearch}
                  debounceTime={400}
                  className={classes.searchBar}
                  isSearching={isSearching}
                  tooltipText={
                    this.props.category === 'community'
                      ? `Hint: try searching for a specific item by prepending your
                  search term with "username:", "label:", or "description:"`
                      : ''
                  }
                  label="Search by Label, Username, or Description"
                  hideLabel
                  defaultValue={query}
                />
              </div>
              <Table
                aria-label="List of StackScripts"
                rowCount={listOfStackScripts.length}
                colCount={isSelecting ? 1 : 4}
                noOverflow={true}
                tableClass={classes.table}
                style={!isSelecting ? { tableLayout: 'fixed' } : undefined}
              >
                <StackScriptTableHead
                  handleClickTableHeader={this.handleClickTableHeader}
                  sortOrder={sortOrder}
                  currentFilterType={currentFilterType}
                  isSelecting={isSelecting}
                  category={this.props.category}
                />
                <Component
                  {...this.props}
                  {...this.state}
                  getDataAtPage={this.getDataAtPage}
                  getNext={this.getNext}
                />
              </Table>

              {/*
               * show loading indicator if we're getting more stackscripts
               * and if we're not showing the "get more stackscripts" button
               */}
              {gettingMoreStackScripts && !isSorting && (
                <div style={{ margin: '32px 0 32px 0', textAlign: 'center' }}>
                  <CircleProgress mini />
                </div>
              )}
            </React.Fragment>
          )}
          {/*
           * if we're sorting, or if we already loaded all results
           * or if we're in the middle of getting more results, don't render
           * the lazy load trigger
           */}
          {!isSorting && !allStackScriptsLoaded && !gettingMoreStackScripts && (
            <div style={{ textAlign: 'center' }}>
              {/*
               * If the lazy-load failed (marked by the catch in getNext),
               * show the "Show more StackScripts button
               * Otherwise, try to lazy load some more dang stackscripts
               */}
              {!getMoreStackScriptsFailed ? (
                <Waypoint onEnter={this.getNext}>
                  {/*
                   * The reason for this empty div is that there was some wonkiness when
                   * scrolling to the waypoint with trackpads. For some reason, the Waypoint
                   * would never be scrolled into view no matter how much you scrolled on the
                   * trackpad. Especially finicky at zoomed in browser sizes
                   */}
                  <div style={{ minHeight: '150px' }}></div>
                </Waypoint>
              ) : (
                <Button
                  title="Show More StackScripts"
                  onClick={this.getNext}
                  value="Show More"
                  buttonType="secondary"
                  disabled={this.state.gettingMoreStackScripts}
                  style={{ margin: '32px 0 32px 0' }}
                >
                  Show More StackScripts
                </Button>
              )}
            </div>
          )}
        </React.Fragment>
      );
    }
  }

  return compose(withRouter, withProfile, withStyles)(EnhancedComponent);
};

export default withStackScriptBase;

// Update the query string with a `type=` and `query=`.
const updateQueryString = (
  query: string,
  history: RouteComponentProps<{}>['history']
) => {
  const queryString = stringify({ query });

  // Use `replace` instead of `push` so that each keystroke is not a separate
  // browser history item.
  history.replace({
    search: queryString,
  });
};

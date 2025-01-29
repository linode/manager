import { Box } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { take } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { components } from 'react-select';
import { debounce } from 'throttle-debounce';

import Search from 'src/assets/icons/search.svg';
import EnhancedSelect from 'src/components/EnhancedSelect/Select';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { getImageLabelForLinode } from 'src/features/Images/utils';
import { useAPISearch } from 'src/features/Search/useAPISearch';
import withStoreSearch from 'src/features/Search/withStoreSearch';
import { useIsLargeAccount } from 'src/hooks/useIsLargeAccount';
import { useAllDatabasesQuery } from 'src/queries/databases/databases';
import { useAllDomainsQuery } from 'src/queries/domains';
import { useAllFirewallsQuery } from 'src/queries/firewalls';
import { useAllImagesQuery } from 'src/queries/images';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useAllNodeBalancersQuery } from 'src/queries/nodebalancers';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useSpecificTypes } from 'src/queries/types';
import { useAllVolumesQuery } from 'src/queries/volumes/volumes';
import { formatLinode } from 'src/store/selectors/getSearchEntities';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { isNilOrEmpty } from 'src/utilities/isNilOrEmpty';
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import { StyledIconButton } from './SearchBar.styles';
import { SearchSuggestion } from './SearchSuggestion';

import type { Item } from 'src/components/EnhancedSelect/Select';
import type { SearchProps } from 'src/features/Search/withStoreSearch';

const Control = (props: any) => (
  <components.Control {...props}>
    <Box display="flex" paddingRight={(theme) => theme.tokens.spacing[40]}>
      <Search data-qa-search-icon />
    </Box>
    {props.children}
  </components.Control>
);

/* The final option in the list will be the "go to search results page" link.
 * This doesn't share the same shape as the rest of the results, so should use
 * the default styling. */
const Option = (props: any) => {
  return ['error', 'info', 'redirect'].includes(props.value) ? (
    <components.Option {...props} />
  ) : (
    <SearchSuggestion {...props} />
  );
};

const SearchBar = (props: SearchProps) => {
  const { combinedResults, entitiesLoading, search } = props;
  const [searchText, setSearchText] = React.useState<string>('');
  const [value, setValue] = React.useState<Item | null>(null);
  const [searchActive, setSearchActive] = React.useState<boolean>(false);
  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);
  const [apiResults, setAPIResults] = React.useState<any[]>([]);
  const [apiError, setAPIError] = React.useState<null | string>(null);
  const [apiSearchLoading, setAPILoading] = React.useState<boolean>(false);

  const history = useHistory();
  const isLargeAccount = useIsLargeAccount(searchActive);
  const { isDatabasesEnabled } = useIsDatabasesEnabled();
  const theme = useTheme();

  const isMdScreen = useMediaQuery(theme.breakpoints.only('md'));

  const searchHelperText = isMdScreen
    ? 'Search...'
    : 'Search Products, IP Addresses, Tags...';

  // Only request things if the search bar is open/active and we
  // know if the account is large or not
  const shouldMakeRequests =
    searchActive && isLargeAccount !== undefined && !isLargeAccount;

  const shouldMakeDBRequests =
    shouldMakeRequests && Boolean(isDatabasesEnabled);

  const { data: regions } = useRegionsQuery();

  const { data: objectStorageBuckets } = useObjectStorageBuckets(
    shouldMakeRequests
  );

  const { data: domains } = useAllDomainsQuery(shouldMakeRequests);
  const { data: clusters } = useAllKubernetesClustersQuery(shouldMakeRequests);
  const { data: volumes } = useAllVolumesQuery({}, {}, shouldMakeRequests);
  const { data: nodebalancers } = useAllNodeBalancersQuery(shouldMakeRequests);
  const { data: firewalls } = useAllFirewallsQuery(shouldMakeRequests);

  /*
  @TODO DBaaS: Change the passed argument to 'shouldMakeRequests' and
  remove 'isDatabasesEnabled' once DBaaS V2 is fully rolled out.
  */
  const { data: databases } = useAllDatabasesQuery(shouldMakeDBRequests);

  const { data: _privateImages, isLoading: imagesLoading } = useAllImagesQuery(
    {},
    { is_public: false }, // We want to display private images (i.e., not Debian, Ubuntu, etc. distros)
    shouldMakeRequests
  );
  const { data: publicImages } = useAllImagesQuery(
    {},
    { is_public: true },
    searchActive
  );
  const { data: linodes, isLoading: linodesLoading } = useAllLinodesQuery(
    {},
    {},
    shouldMakeRequests
  );

  const typesQuery = useSpecificTypes(
    (linodes ?? []).map((linode) => linode.type).filter(isNotNullOrUndefined),
    shouldMakeRequests
  );

  const extendedTypes = extendTypesQueryResult(typesQuery);

  const searchableLinodes = (linodes ?? []).map((linode) => {
    const imageLabel = getImageLabelForLinode(linode, publicImages ?? []);
    return formatLinode(linode, extendedTypes, imageLabel);
  });

  const { searchAPI } = useAPISearch(!isNilOrEmpty(searchText));

  const _searchAPI = React.useRef(
    debounce(500, false, (_searchText: string) => {
      setAPILoading(true);
      searchAPI(_searchText)
        .then((searchResults) => {
          setAPIResults(searchResults.combinedResults);
          setAPILoading(false);
          setAPIError(null);
        })
        .catch((error) => {
          setAPIError(
            getAPIErrorOrDefault(error, 'Error loading search results')[0]
              .reason
          );
          setAPILoading(false);
        });
    })
  ).current;

  const buckets = objectStorageBuckets?.buckets || [];

  React.useEffect(() => {
    const { pathname, search } = history.location;
    const query = getQueryParamsFromQueryString(search);

    if (pathname !== '/search') {
      setValue(null);
    } else if (pathname === '/search' && Object.keys(query).length > 0) {
      const q = query.query;
      if (!q) {
        return;
      }

      setValue({ label: q, value: q });
    }
  }, [history.location]);

  React.useEffect(() => {
    // We can't store all data for large accounts for client side search,
    // so use the API's filtering instead.
    if (isLargeAccount) {
      _searchAPI(searchText);
    } else {
      search(
        searchText,
        buckets,
        domains ?? [],
        volumes ?? [],
        clusters ?? [],
        _privateImages ?? [],
        regions ?? [],
        searchableLinodes ?? [],
        nodebalancers ?? [],
        firewalls ?? [],
        databases ?? []
      );
    }
  }, [
    imagesLoading,
    search,
    searchText,
    _searchAPI,
    isLargeAccount,
    objectStorageBuckets,
    domains,
    volumes,
    _privateImages,
    regions,
    nodebalancers,
    firewalls,
    databases,
  ]);

  const handleSearchChange = (_searchText: string): void => {
    setSearchText(_searchText);
  };

  const toggleSearch = () => {
    setSearchActive(!searchActive);
    setMenuOpen(!menuOpen);
  };

  const onClose = () => {
    document.body.classList.remove('searchOverlay');
    setSearchActive(false);
    setMenuOpen(false);
  };

  const onOpen = () => {
    document.body.classList.add('searchOverlay');
    setSearchActive(true);
    setMenuOpen(true);
  };

  const onFocus = () => {
    setSearchActive(true);
    setValue(null);
  };

  const onSelect = (item: Item) => {
    if (!item || item.label === '') {
      return;
    }

    if (item.value === 'info' || item.value === 'error') {
      return;
    }

    const text = item?.data?.searchText ?? '';

    if (item.value === 'redirect') {
      history.push({
        pathname: `/search`,
        search: `?query=${encodeURIComponent(text)}`,
      });
      return;
    }
    history.push(item.data.path);
  };

  const onKeyDown = (e: any) => {
    if (
      e.key === 'Enter' &&
      searchText !== '' &&
      (!combinedResults || combinedResults.length < 1)
    ) {
      history.push({
        pathname: `/search`,
        search: `?query=${encodeURIComponent(searchText)}`,
      });
      onClose();
    }
  };

  const guidanceText = () => {
    if (isLargeAccount) {
      // This fancy stuff won't work if we're using API
      // based search; don't confuse users by displaying this.
      return undefined;
    }
    return (
      <>
        <b>By field:</b> “tag:my-app” “label:my-linode” &nbsp;&nbsp;
        <b>With operators</b>: “tag:my-app AND is:domain”
      </>
    );
  };

  /* Need to override the default RS filtering; otherwise entities whose label
   * doesn't match the search term will be automatically filtered, meaning that
   * searching by tag won't work. */
  const filterResults = () => {
    return true;
  };

  const finalOptions = createFinalOptions(
    isLargeAccount ? apiResults : combinedResults,
    searchText,
    isLargeAccount ? apiSearchLoading : linodesLoading || imagesLoading,
    // Ignore "Unauthorized" errors, since these will always happen on LKE
    // endpoints for restricted users. It's not really an "error" in this case.
    // We still want these users to be able to use the search feature.
    Boolean(apiError) && apiError !== 'Unauthorized'
  );

  // TODO: Make this whole file use <Autocomplete />
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      '&.react-select__control--is-focused, &.react-select__control--is-focused:hover': {
        border: `1px solid ${theme.tokens.header.Search.Border.Active}`,
        boxShadow: 'none',
      },
      '&:focus': {
        border: `1px solid ${theme.tokens.header.Search.Border.Active}`,
      },
      '&:hover': {
        border: `1px solid ${theme.tokens.header.Search.Border.Hover}`,
      },
      backgroundColor: theme.tokens.header.Search.Background,
      border: `1px solid ${theme.tokens.header.Search.Border.Default}`,
      borderRadius: theme.tokens.borderRadius.None,
      cursor: 'text',
      minHeight: 'inherit',
      padding: `${theme.tokens.spacing[30]} ${theme.tokens.spacing[40]}`,
    }),
    indicatorsContainer: () => ({ display: 'none' }),
    input: (base: any) => ({
      ...base,
      color: theme.tokens.header.Search.Text.Filled,
    }),
    menu: (base: any) => ({
      ...base,
      // This is the tag operator container
      '> div': {
        '.MuiTypography-root': {
          color: theme.tokens.dropdown.Text.Default,
        },
        background: theme.tokens.background.Neutralsubtle,
        borderTop: `1px solid ${theme.tokens.border.Normal}`,
      },
      background: theme.tokens.dropdown.Background.Default,
      border: 0,
      borderRadius: theme.tokens.borderRadius.None,
      boxShadow: theme.tokens.elevation.S,
      margin: `${theme.tokens.spacing[20]} 0 0 0`,
      maxWidth: '100%',
    }),
    menuList: (base: any) => ({
      ...base,
      // No Options Message
      '> div > p': {
        backgroundColor: theme.tokens.dropdown.Background.Default,
        color: theme.tokens.dropdown.Text.Default,
        padding: `${theme.tokens.spacing[40]} ${theme.tokens.spacing[50]}`,
      },
      padding: 0,
    }),
    option: (base: any) => ({
      ...base,
      backgroundColor: theme.tokens.dropdown.Background.Default,
      color: theme.tokens.dropdown.Text.Default,
    }),
    singleValue: (base: any) => ({
      ...base,
      color: theme.tokens.header.Search.Text.Filled,
      overflow: 'hidden',
    }),
    valueContainer: (base: any) => ({
      ...base,
      '&&': {
        padding: 0,
      },
      '.select-placeholder': {
        color: theme.tokens.header.Search.Text.Placeholder,
        font: theme.tokens.typography.Label.Regular.Placeholder,
        fontStyle: 'italic',
        left: 0,
      },
      '> div': {
        margin: 0,
        padding: 0,
      },
    }),
  };

  return (
    <React.Fragment>
      <StyledIconButton
        aria-label="open menu"
        color="inherit"
        disableRipple
        onClick={toggleSearch}
        size="large"
      >
        <Search />
      </StyledIconButton>
      <Box
        sx={{
          maxWidth: '800px',
          [theme.breakpoints.down('sm')]: {
            left: '50%',
            opacity: searchActive ? 1 : 0,
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            visibility: searchActive ? 'visible' : 'hidden',
            width: `calc(100% - ${theme.tokens.spacing[80]})`,
            zIndex: searchActive ? 3 : 0,
          },
        }}
      >
        <label className="visually-hidden" htmlFor="main-search">
          Main search
        </label>
        <EnhancedSelect
          blurInputOnSelect
          components={{ Control, Option }}
          filterOption={filterResults}
          guidance={guidanceText()}
          hideLabel
          isClearable={false}
          isLoading={entitiesLoading}
          isMulti={false}
          label="Main search"
          menuIsOpen={menuOpen}
          onChange={onSelect}
          onFocus={onFocus}
          onInputChange={handleSearchChange}
          onKeyDown={onKeyDown}
          onMenuClose={onClose}
          onMenuOpen={onOpen}
          openMenuOnClick={false}
          openMenuOnFocus={false}
          options={finalOptions}
          placeholder={searchHelperText}
          styles={selectStyles}
          value={value}
        />
      </Box>
    </React.Fragment>
  );
};

export const createFinalOptions = (
  results: Item[],
  searchText: string = '',
  loading: boolean = false,
  error: boolean = false
) => {
  const redirectOption = {
    data: {
      searchText,
    },
    label: `View search results page for "${searchText}"`,
    value: 'redirect',
  };

  const loadingResults = {
    label: 'Loading results...',
    value: 'info',
  };

  const searchError = {
    label: 'Error retrieving search results',
    value: 'error',
  };

  // Results aren't final as we're loading data
  if (loading) {
    return [redirectOption, loadingResults];
  }

  if (error) {
    return [searchError];
  }

  // NO RESULTS:
  if (!results || results.length === 0) {
    return [];
  }

  // LESS THAN 20 RESULTS:
  if (results.length <= 20) {
    return [redirectOption, ...results];
  }

  // MORE THAN 20 RESULTS:
  const lastOption = {
    data: {
      searchText,
    },
    label: `View all ${results.length} results for "${searchText}"`,
    value: 'redirect',
  };

  const first20Results = take(20, results);
  return [redirectOption, ...first20Results, lastOption];
};

export default withStoreSearch()(SearchBar);

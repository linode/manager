import Close from '@mui/icons-material/Close';
import Search from '@mui/icons-material/Search';
import { take } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { components } from 'react-select';
import { debounce } from 'throttle-debounce';

import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import { getImageLabelForLinode } from 'src/features/Images/utils';
import useAPISearch from 'src/features/Search/useAPISearch';
import withStoreSearch, {
  SearchProps,
} from 'src/features/Search/withStoreSearch';
import { useIsLargeAccount } from 'src/hooks/useIsLargeAccount';
import { useAllDomainsQuery } from 'src/queries/domains';
import { useAllImagesQuery } from 'src/queries/images';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useAllNodeBalancersQuery } from 'src/queries/nodebalancers';
import {
  useObjectStorageBuckets,
  useObjectStorageClusters,
} from 'src/queries/objectStorage';
import { useRegionsQuery } from 'src/queries/regions';
import { useSpecificTypes } from 'src/queries/types';
import { useAllVolumesQuery } from 'src/queries/volumes';
import { formatLinode } from 'src/store/selectors/getSearchEntities';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { isNilOrEmpty } from 'src/utilities/isNilOrEmpty';
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';

import {
  StyledIconButton,
  StyledSearchBarWrapperDiv,
} from './SearchBar.styles';
import { SearchSuggestion } from './SearchSuggestion';

const Control = (props: any) => <components.Control {...props} />;

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

// Style overrides for React Select
export const selectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: '#f4f4f4',
    border: 0,
    margin: 0,
    width: '100%',
  }),
  dropdownIndicator: () => ({ display: 'none' }),
  input: (base: any) => ({ ...base, border: 0, margin: 0, width: '100%' }),
  menu: (base: any) => ({ ...base, maxWidth: '100% !important' }),
  placeholder: (base: any) => ({
    ...base,
    color: base?.palette?.text?.primary,
    fontSize: '0.875rem',
  }),
  selectContainer: (base: any) => ({
    ...base,
    border: 0,
    margin: 0,
    width: '100%',
  }),
};

const SearchBar = (props: SearchProps) => {
  const { combinedResults, entitiesLoading, search } = props;
  const [searchText, setSearchText] = React.useState<string>('');
  const [searchActive, setSearchActive] = React.useState<boolean>(false);
  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);
  const [apiResults, setAPIResults] = React.useState<any[]>([]);
  const [apiError, setAPIError] = React.useState<null | string>(null);
  const [apiSearchLoading, setAPILoading] = React.useState<boolean>(false);
  const history = useHistory();
  const isLargeAccount = useIsLargeAccount(searchActive);
  const { data: regions } = useRegionsQuery();

  // Only request things if the search bar is open/active and we
  // know if the account is large or not
  const shouldMakeRequests =
    searchActive && isLargeAccount !== undefined && !isLargeAccount;

  const { data: domains } = useAllDomainsQuery(shouldMakeRequests);
  const { data: clusters } = useAllKubernetesClustersQuery(shouldMakeRequests);
  const { data: volumes } = useAllVolumesQuery({}, {}, shouldMakeRequests);
  const { data: nodebalancers } = useAllNodeBalancersQuery(shouldMakeRequests);

  const { data: objectStorageClusters } = useObjectStorageClusters(
    shouldMakeRequests
  );

  const { data: objectStorageBuckets } = useObjectStorageBuckets(
    objectStorageClusters,
    shouldMakeRequests
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
        nodebalancers ?? []
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
    apiSearchLoading || linodesLoading || imagesLoading,
    // Ignore "Unauthorized" errors, since these will always happen on LKE
    // endpoints for restricted users. It's not really an "error" in this case.
    // We still want these users to be able to use the search feature.
    Boolean(apiError) && apiError !== 'Unauthorized'
  );

  return (
    <React.Fragment>
      <StyledIconButton
        aria-label="open menu"
        color="inherit"
        onClick={toggleSearch}
        size="large"
      >
        <Search />
      </StyledIconButton>
      <StyledSearchBarWrapperDiv className={searchActive ? 'active' : ''}>
        <Search
          data-qa-search-icon
          sx={{ color: '#c9cacb', fontSize: '2rem' }}
        />
        <label className="visually-hidden" htmlFor="main-search">
          Main search
        </label>
        <EnhancedSelect
          placeholder={
            searchActive
              ? 'Search'
              : 'Search for Linodes, Volumes, NodeBalancers, Domains, Buckets, Tags...'
          }
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
          onInputChange={handleSearchChange}
          onKeyDown={onKeyDown}
          onMenuClose={onClose}
          onMenuOpen={onOpen}
          openMenuOnClick={false}
          openMenuOnFocus={false}
          options={finalOptions}
          styles={selectStyles}
        />
        <StyledIconButton
          aria-label="close menu"
          color="inherit"
          onClick={toggleSearch}
          size="large"
        >
          <Close
            sx={(theme) => ({
              '& > span': {
                padding: 2,
              },
              '&:hover, &:focus': {
                color: theme.palette.primary.main,
              },
            })}
          />
        </StyledIconButton>
      </StyledSearchBarWrapperDiv>
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

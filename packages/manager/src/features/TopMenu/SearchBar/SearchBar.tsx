import {
  Autocomplete,
  Box,
  IconButton,
  InputAdornment,
  TextField,
} from '@linode/ui';
import {
  getQueryParamsFromQueryString,
  isNotNullOrUndefined,
} from '@linode/utilities';
import Close from '@mui/icons-material/Close';
import { useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { debounce } from 'throttle-debounce';

import Search from 'src/assets/icons/search.svg';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { getImageLabelForLinode } from 'src/features/Images/utils';
import { useAPISearch } from 'src/features/Search/useAPISearch';
import withStoreSearch from 'src/features/Search/withStoreSearch';
import { useIsLargeAccount } from 'src/hooks/useIsLargeAccount';
import { useAllDatabasesQuery } from 'src/queries/databases/databases';
import { useAllDomainsQuery } from 'src/queries/domains';
import {
  useAllFirewallsQuery,
  useAllLinodesQuery,
  useAllNodeBalancersQuery,
  useRegionsQuery,
} from '@linode/queries';
import { useAllImagesQuery } from 'src/queries/images';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';
import { useSpecificTypes } from 'src/queries/types';
import { useAllVolumesQuery } from 'src/queries/volumes/volumes';
import { formatLinode } from 'src/store/selectors/getSearchEntities';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { isNilOrEmpty } from 'src/utilities/isNilOrEmpty';

import { StyledIconButton, StyledSearchIcon } from './SearchBar.styles';
import { SearchSuggestion } from './SearchSuggestion';
import { StyledSearchSuggestion } from './SearchSuggestion.styles';
import { SearchSuggestionContainer } from './SearchSuggestionContainer';
import { createFinalOptions } from './utils';

import type { SearchableItem } from 'src/features/Search/search.interfaces';
import type { SearchProps } from 'src/features/Search/withStoreSearch';

export interface ExtendedSearchableItem
  extends Omit<SearchableItem, 'entityType'> {
  icon?: React.ReactNode;
  value: 'error' | 'info' | 'redirect';
}

export type SearchResultItem = ExtendedSearchableItem | SearchableItem;

/**
 * Check if the option needs to be rendered without the SearchSuggestion component (redirect, error, info)
 */
const isSpecialOption = (
  option: SearchResultItem
): option is ExtendedSearchableItem => {
  return ['error', 'info', 'redirect'].includes(String(option.value));
};

const SearchBarComponent = (props: SearchProps) => {
  const { combinedResults, entitiesLoading, search } = props;
  const [searchText, setSearchText] = React.useState<string>('');
  const [value, setValue] = React.useState<SearchResultItem | null>(null);
  const [searchActive, setSearchActive] = React.useState<boolean>(false);
  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);
  const [apiResults, setAPIResults] = React.useState<SearchableItem[]>([]);
  const [apiError, setAPIError] = React.useState<null | string>(null);
  const [apiSearchLoading, setAPILoading] = React.useState<boolean>(false);
  const history = useHistory();
  const isLargeAccount = useIsLargeAccount(searchActive);
  const { isDatabasesEnabled } = useIsDatabasesEnabled();
  const theme = useTheme();

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
      setSearchText('');
    } else if (pathname === '/search' && Object.keys(query).length > 0) {
      const q = query.query;
      if (!q) {
        return;
      }

      setSearchText(q);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleClose = () => {
    document.body.classList.remove('searchOverlay');
    setSearchActive(false);
    setSearchText('');
    setMenuOpen(false);
  };

  const handleOpen = () => {
    document.body.classList.add('searchOverlay');
    setSearchActive(true);
    setMenuOpen(true);
  };

  const handleFocus = () => {
    setSearchActive(true);
    setSearchText('');
  };

  const handleBlur = () => {
    if (searchText === '') {
      handleClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && searchText !== '' && combinedResults) {
      history.push({
        pathname: `/search`,
        search: `?query=${encodeURIComponent(searchText)}`,
      });
      handleClose();
    }
  };

  const onSelect = (item: SearchResultItem) => {
    if (!item || item.label === '') {
      return;
    }

    if (item.value === 'info' || item.value === 'error') {
      return;
    }

    if (isSpecialOption(item)) {
      const text = item.data.searchText;
      if (item.value === 'redirect') {
        history.push({
          pathname: `/search`,
          search: `?query=${encodeURIComponent(text)}`,
        });
      }
      return;
    }

    history.push(item.data.path);
    handleClose();
  };

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const label = isSmallScreen
    ? 'Search...'
    : 'Search Products, IP Addresses, Tags...';

  const options = createFinalOptions(
    isLargeAccount ? apiResults : combinedResults,
    searchText,
    isLargeAccount ? apiSearchLoading : linodesLoading || imagesLoading,
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
            width: `calc(100% - ${theme.tokens.spacing.S32})`,
            zIndex: searchActive ? 3 : 0,
          },
        }}
      >
        <label className="visually-hidden" htmlFor="main-search">
          Main search
        </label>
        <Autocomplete<SearchResultItem, false, boolean, false>
          filterOptions={(options) => {
            /* Need to override the default RS filtering; otherwise entities whose label
             * doesn't match the search term will be automatically filtered, meaning that
             * searching by tag won't work. */
            return options;
          }}
          onChange={(_, value) => {
            if (value) {
              onSelect(value);
            }
          }}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                onChange={(e) => {
                  handleSearchChange(e.target.value);
                }}
                slotProps={{
                  htmlInput: {
                    ...params.inputProps,
                    sx: {
                      '&::placeholder': {
                        color: theme.tokens.component.GlobalHeader.Search.Text.Placeholder,
                      },
                    },
                  },
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          sx={{
                            '> svg': {
                              '&:hover': {
                                color: theme.tokens.component.GlobalHeader.Search.Icon.Hover,
                              },
                              color: theme.tokens.component.GlobalHeader.Search.Icon.Default,
                            },
                            padding: 0,
                            [theme.breakpoints.up('sm')]: {
                              display: 'none',
                            },
                          }}
                          aria-label="close menu"
                          color="inherit"
                          onClick={toggleSearch}
                          size="large"
                        >
                          <Close />
                        </IconButton>
                      </InputAdornment>
                    ),
                    startAdornment: (
                      <InputAdornment position="start">
                        <StyledSearchIcon data-qa-search-icon="true" />
                      </InputAdornment>
                    ),
                    sx: {
                      '&:active, &:focus, &.Mui-focused, &.Mui-focused:hover': {
                        backgroundColor: theme.tokens.component.GlobalHeader.Search.Background,
                        borderColor: theme.tokens.component.GlobalHeader.Search.Border.Active,
                        color: theme.tokens.component.GlobalHeader.Search.Text.Filled,
                      },
                      '&:hover': {
                        backgroundColor: theme.tokens.component.GlobalHeader.Search.Background,
                        borderColor: theme.tokens.component.GlobalHeader.Search.Border.Hover,
                        color: theme.tokens.component.GlobalHeader.Search.Text.Filled,
                      },
                      backgroundColor: theme.tokens.component.GlobalHeader.Search.Background,
                      borderColor: theme.tokens.component.GlobalHeader.Search.Border.Default,
                      color: theme.tokens.component.GlobalHeader.Search.Text.Filled,
                      maxWidth: '100%',
                    },
                  },
                }}
                sx={{
                  '& .MuiInputBase-root.MuiAutocomplete-inputRoot': {
                    paddingRight: theme.tokens.spacing.S8,
                  },
                }}
                hideLabel
                label={label}
                placeholder={label}
              />
            );
          }}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            const value = String(option.value);

            if (isSpecialOption(option)) {
              return (
                <StyledSearchSuggestion
                  {...rest}
                  sx={(theme) => ({
                    '&.MuiButtonBase-root.MuiMenuItem-root': {
                      padding: `${theme.spacing(1)} !important`,
                    },
                    font: theme.font.bold,
                  })}
                  key={`${key}-${value}`}
                >
                  {option.icon && (
                    <Box
                      sx={{
                        '& svg': {
                          height: 26,
                          position: 'relative',
                          top: 2,
                          width: 26,
                        },
                        mx: 1.5,
                      }}
                    >
                      {option.icon}
                    </Box>
                  )}
                  {option.label}
                </StyledSearchSuggestion>
              );
            }

            return (
              <SearchSuggestion
                {...rest}
                data={{
                  data: option.data,
                  label: option.label,
                }}
                key={`${key}-${value}`}
                searchText={searchText}
                selectOption={() => onSelect(option)}
                selectProps={{ onMenuClose: handleClose }}
              />
            );
          }}
          slots={{
            paper: (props) => (
              <SearchSuggestionContainer
                {...props}
                isLargeAccount={isLargeAccount}
              />
            ),
          }}
          sx={{
            maxWidth: '100%',
          }}
          autoHighlight
          data-qa-main-search
          disableClearable
          inputValue={searchText}
          label={label}
          loading={entitiesLoading}
          multiple={false}
          noOptionsText="No results"
          onBlur={handleBlur}
          onClose={handleClose}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onOpen={handleOpen}
          open={menuOpen && searchText !== ''}
          options={options}
          placeholder={label}
          popupIcon={null}
          value={value}
        />
      </Box>
    </React.Fragment>
  );
};

export const SearchBar = withStoreSearch()(SearchBarComponent);

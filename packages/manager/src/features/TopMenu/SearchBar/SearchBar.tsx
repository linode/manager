// import EnhancedSelect from 'src/components/EnhancedSelect/Select';
import { Autocomplete, TextField } from '@linode/ui';
import Close from '@mui/icons-material/Close';
import Search from '@mui/icons-material/Search';
import { Box, Paper } from '@mui/material';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { debounce } from 'throttle-debounce';

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

import {
  StyledIconButton,
  StyledSearchBarWrapperDiv,
} from './SearchBar.styles';
import { SearchSuggestion } from './SearchSuggestion';
import { createFinalOptions } from './utils';

import type { SearchSuggestionT } from './SearchSuggestion';
import type { PaperProps } from '@mui/material';
import type { SearchProps } from 'src/features/Search/withStoreSearch';

interface SearchOption {
  data: SearchSuggestionT;
  label: string;
  value: number | string;
}

// Special option type for redirect/info/error cases
interface SpecialOption {
  data: {
    searchText: string;
  };
  label: string;
  value: 'error' | 'info' | 'redirect';
}

export type Option = SearchOption | SpecialOption;

const isSpecialOption = (option: Option): option is SpecialOption => {
  return ['redirect', 'error', 'info'].includes(String(option.value));
};

// Style overrides for React Select
export const selectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: 'pink',
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

const SearchBarComponent = (props: SearchProps) => {
  const { combinedResults, entitiesLoading, search } = props;
  const [searchText, setSearchText] = React.useState<string>('');
  const [value, setValue] = React.useState<Option | null>(null);
  const [searchActive, setSearchActive] = React.useState<boolean>(false);
  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);
  const [apiResults, setAPIResults] = React.useState<any[]>([]);
  const [apiError, setAPIError] = React.useState<null | string>(null);
  const [apiSearchLoading, setAPILoading] = React.useState<boolean>(false);
  const history = useHistory();
  const isLargeAccount = useIsLargeAccount(searchActive);
  const { isDatabasesEnabled } = useIsDatabasesEnabled();

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

      setValue({
        data: {
          searchText: q,
        },
        label: q,
        value: 'redirect',
      } as SpecialOption);
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
    setSearchText('');
    setSearchActive(true);
    setMenuOpen(true);
  };

  const onFocus = () => {
    setSearchActive(true);
    setValue(null);
  };

  const onSelect = (item: Option) => {
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

  const finalOptions = createFinalOptions(
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
        onClick={toggleSearch}
        size="large"
      >
        <Search />
      </StyledIconButton>
      <StyledSearchBarWrapperDiv className={searchActive ? 'active' : ''}>
        <Search
          sx={(theme) => ({
            color: theme.tokens.color.Neutrals[40],
            fontSize: '2rem',
          })}
          data-qa-search-icon
        />
        <label className="visually-hidden" htmlFor="main-search">
          Main search
        </label>
        <Autocomplete
          // styles={selectStyles}
          PaperComponent={(props) => (
            <CustomPaper {...props} isLargeAccount={isLargeAccount} />
          )}
          filterOptions={(options) => {
            /* Need to override the default RS filtering; otherwise entities whose label
             * doesn't match the search term will be automatically filtered, meaning that
             * searching by tag won't work. */
            return options;
          }}
          onChange={(_, value) => {
            if (value) {
              onSelect(value as Option);
            }
          }}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: null,
                }}
                onChange={(e) => {
                  handleSearchChange(e.target.value);
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    border: 'none',
                    boxShadow: 'none !important',
                    minHeight: 30,
                  },
                }}
                hideLabel
                label="Main search"
                placeholder="Search Products, IP Addresses, Tags..."
              />
            );
          }}
          renderOption={(props, option, { selected }) => {
            const { key, ...rest } = props;
            const value = String(option.value);

            // Skip rendering for special options like 'redirect', 'error', 'info'
            if (['error', 'info', 'redirect'].includes(value)) {
              return (
                <li {...rest} key={`${key}-${value}`}>
                  {option.label}
                </li>
              );
            }

            return (
              <SearchSuggestion
                data={{
                  data: option.data as SearchSuggestionT,
                  label: option.label,
                }}
                isFocused={selected}
                key={`${key}-${value}`}
                searchText={searchText}
                selectOption={() => onSelect(option as Option)}
                selectProps={{ onMenuClose: onClose }}
              />
            );
          }}
          sx={{
            width: '100%',
          }}
          label="Main search"
          loading={entitiesLoading}
          multiple={false}
          onBlur={onClose}
          onClose={onClose}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          onOpen={onOpen}
          open={menuOpen && searchText !== ''}
          options={finalOptions as Option[]}
          placeholder="Search Products, IP Addresses, Tags..."
          value={value}
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

export const SearchBar = withStoreSearch()(SearchBarComponent);

interface CustomPaperProps extends PaperProps {
  isLargeAccount?: boolean;
}

const CustomPaper = (props: CustomPaperProps) => {
  const { children, isLargeAccount, ...rest } = props;

  return (
    <Paper {...rest}>
      <div>
        {children}
        {!isLargeAccount && (
          <Box
            sx={(theme) => ({
              borderTop: `1px solid ${theme.palette.divider}`,
              fontSize: '0.875rem',
              padding: theme.spacing(1),
            })}
          >
            <b>By field:</b> "tag:my-app" "label:my-linode" &nbsp;&nbsp;
            <b>With operators</b>: "tag:my-app AND is:domain"
          </Box>
        )}
      </div>
    </Paper>
  );
};

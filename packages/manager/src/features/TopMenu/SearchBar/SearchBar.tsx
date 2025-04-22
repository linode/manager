import {
  Autocomplete,
  Box,
  IconButton,
  InputAdornment,
  TextField,
} from '@linode/ui';
import { getQueryParamsFromQueryString } from '@linode/utilities';
import Close from '@mui/icons-material/Close';
import { useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import { useHistory } from 'react-router-dom';

import Search from 'src/assets/icons/search.svg';
import { useSearch } from 'src/features/Search/useSearch';

import { StyledIconButton, StyledSearchIcon } from './SearchBar.styles';
import { SearchSuggestion } from './SearchSuggestion';
import { StyledSearchSuggestion } from './SearchSuggestion.styles';
import { SearchSuggestionContainer } from './SearchSuggestionContainer';
import { createFinalOptions } from './utils';

import type { SearchableItem } from 'src/features/Search/search.interfaces';

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

export const SearchBar = () => {
  // Search state
  const [searchText, setSearchText] = React.useState<string>('');
  const { combinedResults, isLargeAccount, isLoading } = useSearch({
    query: searchText,
  });

  // MUI Autocomplete state
  const [value, setValue] = React.useState<SearchResultItem | null>(null);
  const [searchActive, setSearchActive] = React.useState<boolean>(false);
  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);

  // Hooks
  const history = useHistory();
  const theme = useTheme();

  // Sync state with query params
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
    if (history.location.pathname !== '/search') {
      setSearchText('');
    }
    setMenuOpen(false);
  };

  const handleOpen = () => {
    document.body.classList.add('searchOverlay');
    setSearchActive(true);
    setMenuOpen(true);
  };

  const handleFocus = () => {
    setSearchActive(true);
    if (history.location.pathname !== '/search') {
      setSearchText('');
    }
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
      if (item.value === 'redirect') {
        history.push({
          pathname: `/search`,
          search: `?query=${encodeURIComponent(searchText)}`,
        });
      }
      return;
    }

    history.push(item.data.path);
    handleClose();
  };

  const options = createFinalOptions(
    combinedResults,
    searchText,
    isLoading,
    false // @todo handle errors. Because we make many API calls, we need a good way to handle partial errors.
  );

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const label = isSmallScreen
    ? 'Search...'
    : 'Search Products, IP Addresses, Tags...';

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
                        color:
                          theme.tokens.component.GlobalHeader.Search.Text
                            .Placeholder,
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
                                color:
                                  theme.tokens.component.GlobalHeader.Search
                                    .Icon.Hover,
                              },
                              color:
                                theme.tokens.component.GlobalHeader.Search.Icon
                                  .Default,
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
                        backgroundColor:
                          theme.tokens.component.GlobalHeader.Search.Background,
                        borderColor:
                          theme.tokens.component.GlobalHeader.Search.Border
                            .Active,
                        color:
                          theme.tokens.component.GlobalHeader.Search.Text
                            .Filled,
                      },
                      '&:hover': {
                        backgroundColor:
                          theme.tokens.component.GlobalHeader.Search.Background,
                        borderColor:
                          theme.tokens.component.GlobalHeader.Search.Border
                            .Hover,
                        color:
                          theme.tokens.component.GlobalHeader.Search.Text
                            .Filled,
                      },
                      backgroundColor:
                        theme.tokens.component.GlobalHeader.Search.Background,
                      borderColor:
                        theme.tokens.component.GlobalHeader.Search.Border
                          .Default,
                      color:
                        theme.tokens.component.GlobalHeader.Search.Text.Filled,
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
                data={option}
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
          keepSearchEnabledOnMobile
          label={label}
          loading={isLoading}
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

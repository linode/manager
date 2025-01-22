import { Autocomplete, InputAdornment, Notice } from '@linode/ui';
import Search from '@mui/icons-material/Search';
import { pathOr } from 'ramda';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { debounce } from 'throttle-debounce';

import withSearch from '../SearchHOC';
import { SearchItem } from './SearchItem';

import type { AlgoliaState as AlgoliaProps } from '../SearchHOC';
import type { ConvertedItems } from '../SearchHOC';
import type { RouteComponentProps } from 'react-router-dom';

interface SelectedItem {
  data: { source: string };
  label: string;
  value: string;
}
interface AlgoliaSearchBarProps extends AlgoliaProps, RouteComponentProps<{}> {}

/**
 * For Algolia search to work locally, ensure you have valid values set for
 * REACT_APP_ALGOLIA_APPLICATION_ID and REACT_APP_ALGOLIA_SEARCH_KEY in your .env file.
 */
const AlgoliaSearchBar = (props: AlgoliaSearchBarProps) => {
  const [inputValue, setInputValue] = React.useState('');
  const {
    history,
    searchAlgolia,
    searchEnabled,
    searchError,
    searchResults,
  } = props;

  const options = React.useMemo(() => {
    const [docs, community] = searchResults;
    const mergedOptions = [...docs, ...community];

    return [
      { data: { source: 'finalLink' }, label: inputValue, value: 'search' },
      ...mergedOptions,
    ];
  }, [inputValue, searchResults]);

  const onInputValueChange = (inputValue: string) => {
    setInputValue(inputValue);
    debouncedSearchAlgolia(inputValue);
  };

  const debouncedSearchAlgolia = React.useCallback(
    debounce(200, false, (inputValue: string) => {
      searchAlgolia(inputValue);
    }),
    [searchAlgolia]
  );

  const getLinkTarget = (inputValue: string) => {
    return inputValue
      ? `/support/search/?query=${inputValue}`
      : '/support/search/';
  };

  const handleSelect = (selected: ConvertedItems | SelectedItem | null) => {
    if (!selected || !inputValue) {
      return;
    }

    const href = pathOr('', ['data', 'href'], selected);
    if (href) {
      // If an href exists for the selected option, redirect directly to that link.
      window.open(href, '_blank', 'noopener');
    } else {
      // If no href, we redirect to the search landing page.
      const link = getLinkTarget(inputValue);
      history.push(link);
    }
  };
  return (
    <React.Fragment>
      {searchError && (
        <Notice
          sx={(theme) => ({
            '& p': {
              color: theme.color.white,
              fontFamily: 'LatoWeb',
            },
          })}
          spacingTop={8}
          variant="error"
        >
          {searchError}
        </Notice>
      )}
      <Autocomplete
        renderOption={(props, option) => {
          return (
            <SearchItem
              data={option}
              {...props}
              key={`${props.key}-${option.value}`}
            />
          );
        }}
        slotProps={{
          paper: {
            sx: (theme) => ({
              '& .MuiAutocomplete-listbox': {
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                border: 'none !important',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              },
              '& .MuiAutocomplete-option': {
                ':hover': {
                  backgroundColor:
                    theme.name == 'light'
                      ? `${theme.tokens.color.Brand[10]} !important`
                      : `${theme.tokens.color.Neutrals[80]} !important`,
                  color: theme.color.black,
                  transition: 'background-color 0.2s',
                },
              },
              boxShadow: '0px 2px 8px 0px rgba(58, 59, 63, 0.18)',
              marginTop: 0.5,
            }),
          },
        }}
        sx={(theme) => ({
          maxHeight: 500,
          [theme.breakpoints.up('md')]: {
            width: 500,
          },
          width: 300,
        })}
        textFieldProps={{
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <Search
                  sx={(theme) => ({
                    color: `${theme.tokens.search.Default.SearchIcon} !important`,
                  })}
                  data-qa-search-icon
                />
              </InputAdornment>
            ),
            sx: (theme) => ({
              '&.Mui-focused': {
                borderColor: `${theme.tokens.color.Brand[70]} !important`,
                boxShadow: 'none',
              },
              ':hover': {
                borderColor: theme.tokens.search.Hover.Border,
              },
            }),
          },
          hideLabel: true,
        }}
        disabled={!searchEnabled}
        inputValue={inputValue}
        label="Search for answers"
        onChange={(_, selected) => handleSelect(selected)}
        onInputChange={(_, value) => onInputValueChange(value)}
        options={options}
        placeholder="Search"
      />
    </React.Fragment>
  );
};

export default withSearch({ highlight: false, hitsPerPage: 10 })(
  withRouter(AlgoliaSearchBar)
);

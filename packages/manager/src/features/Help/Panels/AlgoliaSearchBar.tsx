import { Autocomplete, InputAdornment, Notice } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { debounce } from 'throttle-debounce';

import Search from 'src/assets/icons/search.svg';

import withSearch from '../SearchHOC';
import { SearchItem } from './SearchItem';

import type { AlgoliaState as AlgoliaProps } from '../SearchHOC';
import type { ConvertedItems } from '../SearchHOC';

interface SelectedItem {
  data: { source: string };
  label: string;
  value: string;
}

/**
 * For Algolia search to work locally, ensure you have valid values set for
 * REACT_APP_ALGOLIA_APPLICATION_ID and REACT_APP_ALGOLIA_SEARCH_KEY in your .env file.
 */
const AlgoliaSearchBar = (props: AlgoliaProps) => {
  const [inputValue, setInputValue] = React.useState('');
  const { searchAlgolia, searchEnabled, searchError, searchResults } = props;
  const navigate = useNavigate();

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

  const handleSelect = (selected: ConvertedItems | null | SelectedItem) => {
    if (!selected || !inputValue) {
      return;
    }

    const href =
      selected?.data && 'href' in selected.data ? selected.data.href : '';
    if (href) {
      // If an href exists for the selected option, redirect directly to that link.
      window.open(href, '_blank', 'noopener');
    } else {
      // If no href, we redirect to the search landing page.
      navigate({
        to: '/support/search',
        search: { query: inputValue || undefined },
      });
    }
  };
  return (
    <React.Fragment>
      {searchError && (
        <Notice
          spacingTop={8}
          sx={(theme) => ({
            '& p': {
              color: theme.tokens.color.Neutrals.White,
            },
          })}
          variant="error"
        >
          {searchError}
        </Notice>
      )}
      <Autocomplete
        disabled={!searchEnabled}
        inputValue={inputValue}
        keepSearchEnabledOnMobile
        label="Search for answers"
        onChange={(_, selected) => handleSelect(selected)}
        onInputChange={(_, value) => onInputValueChange(value)}
        options={options}
        placeholder="Search"
        renderOption={(props, option) => {
          return (
            <SearchItem
              data={option}
              {...props}
              key={`${props.key}-${option.value}`}
            />
          );
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
                <Search data-qa-search-icon />
              </InputAdornment>
            ),
          },
          hideLabel: true,
        }}
      />
    </React.Fragment>
  );
};

export default withSearch({ highlight: false, hitsPerPage: 10 })(
  AlgoliaSearchBar
);

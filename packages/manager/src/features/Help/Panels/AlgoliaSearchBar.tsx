import { Autocomplete, InputAdornment, Notice } from '@linode/ui';
import Search from '@mui/icons-material/Search';
import { pathOr } from 'ramda';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { debounce } from 'throttle-debounce';
import { makeStyles } from 'tss-react/mui';

import withSearch from '../SearchHOC';
import { SearchItem } from './SearchItem';

import type { AlgoliaState as AlgoliaProps } from '../SearchHOC';
import type { Theme } from '@mui/material/styles';
import type { RouteComponentProps } from 'react-router-dom';

const useStyles = makeStyles()((theme: Theme) => ({
  enhancedSelectWrapper: {
    '& .input': {
      '& > div': {
        marginRight: 0,
      },
      '& p': {
        color: theme.color.grey1,
        paddingLeft: theme.spacing(3),
      },
      maxWidth: '100%',
    },
    '& .react-select__value-container': {
      paddingLeft: theme.spacing(4),
    },
    margin: '0 auto',
    maxHeight: 500,
    [theme.breakpoints.up('md')]: {
      width: 500,
    },
    width: 300,
  },
  notice: {
    '& p': {
      color: theme.color.white,
      fontFamily: 'LatoWeb',
    },
  },
  root: {
    display: 'flex',
    gap: 12,
  },
  searchIcon: {
    alignSelf: 'center',
    color: theme.color.grey1,
  },
}));

interface AlgoliaSearchBarProps extends AlgoliaProps, RouteComponentProps<{}> {}

const AlgoliaSearchBar = (props: AlgoliaSearchBarProps) => {
  const { classes } = useStyles();
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

  const handleSelect = (selected: any) => {
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
        <Notice className={classes.notice} spacingTop={8} variant="error">
          {searchError}
        </Notice>
      )}
      <div className={classes.root}>
        <Autocomplete
          renderOption={(props, option) => {
            return (
              <SearchItem
                data={option}
                searchText={option.data.source}
                {...props}
              />
            );
          }}
          slotProps={{
            paper: {
              sx: (theme) => ({
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
                '& .MuiInputBase-root': {
                  '&:hover': {
                    border: `1px solid ${theme.tokens.color.Brand[90]}`,
                  },
                },
                boxShadow: '0px 2px 8px 0px rgba(58, 59, 63, 0.18)',
                marginTop: 0.5,
              }),
            },
            popper: {
              sx: {
                '& .MuiAutocomplete-listbox': {
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  border: 'none !important',
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                },
              },
            },
          }}
          textFieldProps={{
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search
                    sx={(theme) => ({
                      color: `${theme.color.grey1}`,
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
                svg: {
                  color: `${theme.tokens.color.Neutrals[70]} !important`,
                },
              }),
            },
            hideLabel: true,
          }}
          className={classes.enhancedSelectWrapper}
          disableClearable={false}
          disabled={!searchEnabled}
          inputValue={inputValue}
          label="Search for answers"
          multiple={false}
          onChange={(_, selected) => handleSelect(selected)}
          onInputChange={(_, value) => onInputValueChange(value)}
          options={options}
          placeholder="Search"
        />
      </div>
    </React.Fragment>
  );
};

export default withSearch({ highlight: false, hitsPerPage: 10 })(
  withRouter(AlgoliaSearchBar)
);

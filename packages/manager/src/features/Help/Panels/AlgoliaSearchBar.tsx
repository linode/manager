import { Autocomplete, Notice } from '@linode/ui';
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
    flexDirection: 'row',
    gap: 12,
  },
  searchIcon: {
    alignSelf: 'center',
    color: theme.color.grey1,
    left: 4,
    top: 40,
    zIndex: 3,
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

  const handleSelect = (selected: number | string) => {
    if (!selected || !inputValue) {
      return;
    }

    if (selected === 'search') {
      const link = getLinkTarget(inputValue);
      history.push(link);
    } else {
      const href = pathOr('', ['data', 'href'], selected);
      if (href) {
        window.open(href, '_blank', 'noopener');
      }
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && inputValue) {
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
        <Search className={classes.searchIcon} data-qa-search-icon />
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
          className={classes.enhancedSelectWrapper}
          disableClearable
          disabled={!searchEnabled}
          inputValue={inputValue}
          label="Search for answers"
          multiple={false}
          onChange={(_, selected) => handleSelect(selected.value)}
          onInputChange={(_, value) => onInputValueChange(value)}
          options={options}
          placeholder="Search for answers..."
          textFieldProps={{ hideLabel: true, onKeyDown: handleKeyDown }}
        />
      </div>
    </React.Fragment>
  );
};

export default withSearch({ highlight: false, hitsPerPage: 10 })(
  withRouter(AlgoliaSearchBar)
);

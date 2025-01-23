import { Notice } from '@linode/ui';
import Search from '@mui/icons-material/Search';
import { pathOr } from 'ramda';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { debounce } from 'throttle-debounce';
import { makeStyles } from 'tss-react/mui';

import EnhancedSelect from 'src/components/EnhancedSelect';
import { selectStyles } from 'src/features/TopMenu/SearchBar/SearchBar';

import withSearch from '../SearchHOC';
import { SearchItem } from './SearchItem';

import type { AlgoliaState as AlgoliaProps } from '../SearchHOC';
import type { Theme } from '@mui/material/styles';
import type { RouteComponentProps } from 'react-router-dom';
import type { Item } from 'src/components/EnhancedSelect';

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
    position: 'relative',
  },
  searchIcon: {
    color: theme.color.grey1,
    left: 5,
    position: 'absolute',
    top: 4,
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

  const handleSelect = (selected: Item<string>) => {
    if (!selected || !inputValue) {
      return;
    }

    if (selected.value === 'search') {
      const link = getLinkTarget(inputValue);
      history.push(link);
    } else {
      const href = pathOr('', ['data', 'href'], selected);
      window.open(href, '_blank', 'noopener');
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
        <EnhancedSelect
          components={
            { DropdownIndicator: () => null, Option: SearchItem } as any
          }
          className={classes.enhancedSelectWrapper}
          disabled={!searchEnabled}
          hideLabel
          inputValue={inputValue}
          isClearable={true}
          isMulti={false}
          label="Search for answers"
          onChange={handleSelect}
          onInputChange={onInputValueChange}
          options={options}
          placeholder="Search for answers..."
          styles={selectStyles}
        />
      </div>
    </React.Fragment>
  );
};

export default withSearch({ highlight: false, hitsPerPage: 10 })(
  withRouter(AlgoliaSearchBar)
);

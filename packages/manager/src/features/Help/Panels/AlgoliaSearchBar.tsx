import Search from '@mui/icons-material/Search';
import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect';
import { Notice } from 'src/components/Notice/Notice';
import { selectStyles } from 'src/features/TopMenu/SearchBar';
import windowIsNarrowerThan from 'src/utilities/breakpoints';
import withSearch, { AlgoliaState as AlgoliaProps } from '../SearchHOC';
import { SearchItem } from './SearchItem';
import { makeStyles } from 'tss-react/mui';
import { Theme, useTheme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    color: theme.color.grey1,
    zIndex: 3,
    top: 4,
    left: 5,
  },
  enhancedSelectWrapper: {
    margin: '0 auto',
    width: 300,
    maxHeight: 500,
    '& .react-select__value-container': {
      paddingLeft: theme.spacing(4),
    },
    '& .input': {
      maxWidth: '100%',
      '& p': {
        paddingLeft: theme.spacing(3),
        color: theme.color.grey1,
      },
      '& > div': {
        marginRight: 0,
      },
    },
    [theme.breakpoints.up('md')]: {
      width: 500,
    },
  },
}));

type CombinedProps = AlgoliaProps & RouteComponentProps<{}>;

const AlgoliaSearchBar = (props: CombinedProps) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const [inputValue, setInputValue] = React.useState('');
  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const { searchEnabled, searchError } = props;

  React.useEffect(() => {
    setMounted(true);
    if (theme) {
      setIsMobile(windowIsNarrowerThan(theme.breakpoints.values.sm));
    }
    return () => setMounted(false);
  }, [isMobile, theme]);

  const getOptionsFromResults = () => {
    const [docs, community] = props.searchResults;
    const options = [...docs, ...community];

    return [
      { value: 'search', label: inputValue, data: { source: 'finalLink' } },
      ...options,
    ];
  };

  const onInputValueChange = (inputValue: string) => {
    if (!mounted) {
      return;
    }
    setInputValue(inputValue);
    props.searchAlgolia(inputValue);
  };

  const getLinkTarget = (inputValue: string) => {
    return inputValue
      ? `/support/search/?query=${inputValue}`
      : '/support/search/';
  };

  const handleSelect = (selected: Item<string>) => {
    if (!selected) {
      return;
    }
    const { history } = props;
    if (!inputValue) {
      return;
    }

    const href = pathOr('', ['data', 'href'], selected);

    if (selected.value === 'search') {
      const link = getLinkTarget(inputValue);
      history.push(link);
    } else {
      window.open(href, '_blank', 'noopener');
    }
  };

  const options = getOptionsFromResults();

  return (
    <React.Fragment>
      {searchError && (
        <Notice error spacingTop={8} spacingBottom={0}>
          {searchError}
        </Notice>
      )}
      <div className={classes.root}>
        <Search className={classes.searchIcon} data-qa-search-icon />
        <EnhancedSelect
          disabled={!searchEnabled}
          isMulti={false}
          isClearable={false}
          inputValue={inputValue}
          options={options}
          components={
            { Option: SearchItem, DropdownIndicator: () => null } as any
          }
          onChange={handleSelect}
          onInputChange={onInputValueChange}
          placeholder="Search for answers..."
          label="Search for answers"
          hideLabel
          className={classes.enhancedSelectWrapper}
          styles={selectStyles}
        />
      </div>
    </React.Fragment>
  );
};

const search = withSearch({ hitsPerPage: 10, highlight: true });

export default compose<CombinedProps, {}>(search, withRouter)(AlgoliaSearchBar);

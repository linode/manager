import { Notice } from '@linode/ui';
import { Box } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { pathOr } from 'ramda';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { components } from 'react-select';
import { debounce } from 'throttle-debounce';
import { makeStyles } from 'tss-react/mui';

import Search from 'src/assets/icons/search.svg';
import EnhancedSelect from 'src/components/EnhancedSelect';

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
      font: theme.font.normal,
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

const Control = (props: any) => (
  <components.Control {...props}>
    <Box display="flex" paddingRight={(theme) => theme.tokens.spacing[40]}>
      <Search data-qa-search-icon />
    </Box>
    {props.children}
  </components.Control>
);

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
  const theme = useTheme();

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

  // TODO: Just use <Autocomplete /> instead of <EnhancedSelect />
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      '&.react-select__control--is-focused, &.react-select__control--is-focused:hover': {
        border: `1px solid ${theme.tokens.search.Focus.Border}`,
        boxShadow: 'none',
      },
      '&:focus': {
        border: `1px solid ${theme.tokens.search.FocusEmpty.Border}`,
      },
      '&:hover': {
        border: `1px solid ${theme.tokens.search.Hover.Border}`,
      },
      backgroundColor: theme.tokens.search.Default.Background,
      border: `1px solid ${theme.tokens.search.Default.Border}`,
      borderRadius: theme.tokens.borderRadius.None,
      minHeight: 'inherit',
      padding: `${theme.tokens.spacing[30]} ${theme.tokens.spacing[40]}`,
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      '.react-select__indicator': {
        color: theme.tokens.content.Icon.Primary.Default,
        padding: 0,
      },
      '.react-select__indicator-separator': {
        display: 'none',
      },
    }),
    input: (base: any) => ({
      ...base,
      color: theme.tokens.search.Default.Text,
    }),
    menu: (base: any) => ({
      ...base,
      background: theme.tokens.dropdown.Background.Default,
      border: 0,
      borderRadius: theme.tokens.borderRadius.None,
      boxShadow: theme.tokens.elevation.S,
      margin: `${theme.tokens.spacing[20]} 0 0 0`,
      maxWidth: '100%',
    }),
    menuList: (base: any) => ({
      ...base,
      // No Options Message
      '> div > p': {
        backgroundColor: theme.tokens.dropdown.Background.Default,
        color: theme.tokens.dropdown.Text.Default,
        padding: `${theme.tokens.spacing[40]} ${theme.tokens.spacing[50]}`,
      },
      padding: 0,
    }),
    option: (base: any) => ({
      ...base,
      '&:hover': {
        backgroundColor: theme.tokens.dropdown.Background.Hover,
      },
      '> .MuiTypography-root': {
        color: theme.tokens.content.Text.Secondary.Default,
        font: theme.tokens.typography.Body.Regular,
      },
      '> div': {
        '> .MuiTypography-root': {
          color: theme.tokens.dropdown.Text.Default,
          font: theme.tokens.typography.Body.Regular,
        },
        '> div': {
          font: theme.tokens.typography.Label.Semibold.S,
        },
        display: 'flex',
        justifyContent: 'space-between',
      },
      backgroundColor: theme.tokens.dropdown.Background.Default,
      color: theme.tokens.dropdown.Text.Default,
    }),
    singleValue: (base: any) => ({
      ...base,
      color: theme.tokens.search.Filled.Text,
      overflow: 'hidden',
    }),
    valueContainer: (base: any) => ({
      ...base,
      '&&': {
        padding: 0,
      },
      '.select-placeholder': {
        color: theme.tokens.search.Default.Text,
        left: 0,
      },
      '> div': {
        margin: 0,
        padding: 0,
      },
    }),
  };

  return (
    <React.Fragment>
      {searchError && (
        <Notice className={classes.notice} spacingTop={8} variant="error">
          {searchError}
        </Notice>
      )}
      <div className={classes.root}>
        <EnhancedSelect
          components={
            {
              Control,
              DropdownIndicator: () => null,
              Option: SearchItem,
            } as any
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

import Close from '@material-ui/icons/Close';
import Search from '@material-ui/icons/Search';
import { take } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { components } from 'react-select';
import { compose } from 'recompose';
import IconButton from 'src/components/core/IconButton';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import { REFRESH_INTERVAL } from 'src/constants';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import withImages, { WithImages } from 'src/containers/withImages.container';
import withStoreSearch, {
  SearchProps
} from 'src/features/Search/withStoreSearch';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { sendSearchBarUsedEvent } from 'src/utilities/ga.ts';
import { debounce } from 'throttle-debounce';
import styled, { StyleProps } from './SearchBar_CMR.styles';
import SearchSuggestion from './SearchSuggestion';

type CombinedProps = WithTypesProps &
  WithImages &
  SearchProps &
  StyleProps &
  RouteComponentProps<{}>;

const Control = (props: any) => <components.Control {...props} />;

/* The final option in the list will be the "go to search results page" link.
 * This doesn't share the same shape as the rest of the results, so should use
 * the default styling. */
const Option = (props: any) => {
  return ['redirect', 'info'].includes(props.value) ? (
    <components.Option {...props} />
  ) : (
    <SearchSuggestion {...props} />
  );
};

// Style overrides for React Select
export const selectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: '#f4f4f4',
    margin: 0,
    width: '100%',
    border: 0
  }),
  input: (base: any) => ({ ...base, margin: 0, width: '100%', border: 0 }),
  selectContainer: (base: any) => ({
    ...base,
    width: '100%',
    margin: 0,
    border: 0
  }),
  dropdownIndicator: () => ({ display: 'none' }),
  placeholder: (base: any) => ({ ...base, color: 'blue' }),
  menu: (base: any) => ({ ...base, maxWidth: '100% !important' })
};

// Timeout of 1sec in debounce to avoid sending too many events to GA
const debouncedSearchAutoEvent = debounce(1000, false, sendSearchBarUsedEvent);

export const SearchBar: React.FC<CombinedProps> = props => {
  const { classes, combinedResults, entitiesLoading, search } = props;

  const [searchText, setSearchText] = React.useState<string>('');
  const [searchActive, setSearchActive] = React.useState<boolean>(false);
  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);

  const { _loading } = useReduxLoad(
    ['linodes', 'nodeBalancers', 'images', 'domains', 'volumes', 'kubernetes'],
    REFRESH_INTERVAL,
    searchActive // Only request things if the search bar is open/active.
  );

  React.useEffect(() => {
    search(searchText);
  }, [_loading, search, searchText]);

  const handleSearchChange = (_searchText: string): void => {
    setSearchText(_searchText);
    // do not trigger debounce for empty text
    if (searchText !== '') {
      debouncedSearchAutoEvent('Search Auto', searchText);
    }
    props.search(_searchText);
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
    setSearchActive(true);
    setMenuOpen(true);
  };

  const onSelect = (item: Item) => {
    if (!item || item.label === '') {
      return;
    }
    const text = item.data.searchText;

    if (item.value === 'info') {
      return;
    }

    if (item.value === 'redirect') {
      props.history.push({
        pathname: `/search`,
        search: `?query=${encodeURIComponent(text)}`
      });
      // we are selecting the View all option sending the user to the landing,
      // this is like key down enter
      sendSearchBarUsedEvent('Search Landing', text);
      return;
    }
    sendSearchBarUsedEvent('Search Select', text);
    props.history.push(item.data.path);
  };

  const onKeyDown = (e: any) => {
    if (
      e.keyCode === 13 &&
      searchText !== '' &&
      (!combinedResults || combinedResults.length < 1)
    ) {
      props.history.push({
        pathname: `/search`,
        search: `?query=${encodeURIComponent(searchText)}`
      });
      sendSearchBarUsedEvent('Search Landing', searchText);
      onClose();
    }
  };

  const guidanceText = () => {
    return (
      <>
        <b>By field:</b> “tag:my-app” “label:my-linode” &nbsp;&nbsp;
        <b>With operators</b>: “tag:my-app AND is:domain”
      </>
    );
  };

  /* Need to override the default RS filtering; otherwise entities whose label
   * doesn't match the search term will be automatically filtered, meaning that
   * searching by tag won't work. */
  const filterResults = () => {
    return true;
  };

  const finalOptions = createFinalOptions(
    combinedResults,
    searchText,
    _loading
  );

  return (
    <React.Fragment>
      <IconButton
        color="inherit"
        aria-label="open menu"
        onClick={toggleSearch}
        className={classes.navIconHide}
      >
        <Search />
      </IconButton>
      <div
        className={`
          ${classes.root}
          ${searchActive ? 'active' : ''}
        `}
      >
        <Search className={classes.icon} data-qa-search-icon />
        <label htmlFor="main-search" className="visually-hidden">
          Main search
        </label>
        <EnhancedSelect
          label="Main search"
          hideLabel
          blurInputOnSelect
          options={finalOptions}
          onChange={onSelect}
          onInputChange={handleSearchChange}
          onKeyDown={onKeyDown}
          placeholder={
            searchActive
              ? 'Search'
              : 'Search for Linodes, Volumes, NodeBalancers, Domains, Tags...'
          }
          components={{ Control, Option }}
          styles={selectStyles}
          openMenuOnFocus={false}
          openMenuOnClick={false}
          filterOption={filterResults}
          isLoading={entitiesLoading}
          isClearable={false}
          isMulti={false}
          onMenuClose={onClose}
          onMenuOpen={onOpen}
          value={false}
          menuIsOpen={menuOpen}
          guidance={guidanceText()}
        />
        <IconButton
          color="inherit"
          aria-label="close menu"
          onClick={toggleSearch}
          className={classes.navIconHide}
        >
          <Close className={classes.close} />
        </IconButton>
      </div>
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  withTypes,
  withRouter,
  withImages(),
  withStoreSearch(),
  styled
)(SearchBar) as React.ComponentType<{}>;

export const createFinalOptions = (
  results: Item[],
  searchText: string = '',
  loading: boolean = false
) => {
  const redirectOption = {
    value: 'redirect',
    data: {
      searchText
    },
    label: `View search results page for "${searchText}"`
  };

  const loadingResults = {
    value: 'info',
    label: 'Loading results...'
  };

  // Results aren't final as we're loading data

  if (loading) {
    return [redirectOption, loadingResults];
  }

  // NO RESULTS:
  if (!results || results.length === 0) {
    return [];
  }

  // LESS THAN 20 RESULTS:
  if (results.length <= 20) {
    return [redirectOption, ...results];
  }

  // MORE THAN 20 RESULTS:
  const lastOption = {
    value: 'redirect',
    data: {
      searchText
    },
    label: `View all ${results.length} results for "${searchText}"`
  };

  const first20Results = take(20, results);
  return [redirectOption, ...first20Results, lastOption];
};

import Close from '@material-ui/icons/Close';
import Search from '@material-ui/icons/Search';
import { compose, take } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import _Control from 'react-select/lib/components/Control';
import _Option from 'react-select/lib/components/Option';
import IconButton from 'src/components/core/IconButton';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import withImages from 'src/containers/withImages.container';
import withStoreSearch, {
  SearchProps
} from 'src/features/Search/withStoreSearch';
import { ApplicationState } from 'src/store';
import styled, { StyleProps } from './SearchBar.styles';
import SearchSuggestion from './SearchSuggestion';

interface State {
  searchText: string;
  searchActive: boolean;
  [resource: string]: any;
  menuOpen: boolean;
}

type CombinedProps = WithTypesProps &
  WithImagesProps &
  SearchProps &
  StyleProps &
  RouteComponentProps<{}>;

const Control = (props: any) => <_Control {...props} />;

/* The final option in the list will be the "go to search results page" link.
 * This doesn't share the same shape as the rest of the results, so should use
 * the default styling. */
const Option = (props: any) => {
  return props.value === 'redirect' ? (
    <_Option {...props} />
  ) : (
    <SearchSuggestion {...props} />
  );
};

// Style overrides for React Select
const selectStyles = {
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
  dropdownIndicator: (base: any) => ({ ...base, display: 'none' }),
  placeholder: (base: any) => ({ ...base, color: 'blue' }),
  menu: (base: any) => ({ ...base, maxWidth: '100% !important' })
};

class SearchBar extends React.Component<CombinedProps, State> {
  selectRef = React.createRef<HTMLInputElement>();

  state: State = {
    searchText: '',
    searchActive: false,
    menuOpen: false
  };

  dataAvailable() {
    return (
      this.state.linodes ||
      this.state.volumes ||
      this.state.nodebalancers ||
      this.state.domains
    );
  }

  handleSearchChange = (searchText: string): void => {
    this.setState({ searchText });
    this.props.search(searchText);
  };

  toggleSearch = () => {
    this.setState({
      searchActive: !this.state.searchActive,
      menuOpen: !this.state.menuOpen
    });
  };

  onClose = () => {
    document.body.classList.remove('searchOverlay');
    this.setState({
      searchActive: false,
      menuOpen: false
    });
  };

  onOpen = () => {
    document.body.classList.add('searchOverlay');
    this.setState({
      searchActive: true,
      menuOpen: true
    });
  };

  onSelect = (item: Item) => {
    if (!item || item.label === '') {
      return;
    }
    const { history } = this.props;
    const { searchText } = item.data;

    if (item.value === 'redirect') {
      history.push({
        pathname: `/search`,
        search: `?query=${encodeURIComponent(searchText)}`
      });
      return;
    }
    history.push(item.data.path);
  };

  guidanceText = () => {
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
  filterResults = (option: Item, inputValue: string) => {
    return true;
  };

  render() {
    const { classes, combinedResults, entitiesLoading } = this.props;
    const { searchActive, searchText, menuOpen } = this.state;

    const finalOptions = createFinalOptions(combinedResults, searchText);

    return (
      <React.Fragment>
        <IconButton
          color="inherit"
          aria-label="open menu"
          onClick={this.toggleSearch}
          className={classes.navIconHide}
          style={{ marginRight: 10 }}
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
          <EnhancedSelect
            id="search-bar"
            blurInputOnSelect
            options={finalOptions}
            onChange={this.onSelect}
            onInputChange={this.handleSearchChange}
            placeholder={
              searchActive
                ? 'Search'
                : 'Search for Linodes, Volumes, NodeBalancers, Domains, Tags...'
            }
            components={{ Control, Option }}
            styleOverrides={selectStyles}
            openMenuOnFocus={false}
            openMenuOnClick={false}
            filterOption={this.filterResults}
            isLoading={entitiesLoading}
            isClearable={false}
            isMulti={false}
            onMenuClose={this.onClose}
            onMenuOpen={this.onOpen}
            value={false}
            menuIsOpen={menuOpen}
            guidance={this.guidanceText()}
          />
          <IconButton
            color="inherit"
            aria-label="close menu"
            onClick={this.toggleSearch}
            className={classes.navIconHide}
          >
            <Close className={classes.close} />
          </IconButton>
        </div>
      </React.Fragment>
    );
  }
}

interface WithTypesProps {
  typesData: Linode.LinodeType[];
}

const withTypes = connect((state: ApplicationState, ownProps) => ({
  typesData: state.__resources.types.entities
}));

interface WithImagesProps {
  imagesData: Linode.Image[];
  imagesLoading: boolean;
}

export default compose(
  styled,
  withTypes,
  withRouter,
  withImages((ownProps, imagesData, imagesLoading) => ({
    ...ownProps,
    imagesData,
    imagesLoading
  })),
  withStoreSearch()
)(SearchBar) as React.ComponentType<{}>;

export const createFinalOptions = (
  results: Item[],
  searchText: string = ''
) => {
  // NO RESULTS:
  if (!results || results.length === 0) {
    return [];
  }

  const firstOption = {
    value: 'redirect',
    data: {
      searchText
    },
    label: `View search results page for "${searchText}"`
  };

  // LESS THAN 20 RESULTS:
  if (results.length <= 20) {
    return [firstOption, ...results];
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
  return [firstOption, ...first20Results, lastOption];
};

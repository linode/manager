import Search from '@material-ui/icons/Search';
import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles,
  WithTheme
} from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import windowIsNarrowerThan from 'src/utilities/breakpoints';
import withSearch, { AlgoliaState as AlgoliaProps } from '../SearchHOC';
import SearchItem from './SearchItem';

type ClassNames =
  | 'root'
  | 'searchItem'
  | 'searchItemHighlighted'
  | 'enhancedSelectWrapper'
  | 'textfield';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    // position: 'relative' /* for search results */,
    // maxHeight: 50,
    // flex: 1,
    // display: 'flex',
    // alignItems: 'center',
    // backgroundColor: theme.bg.main,
    // padding: theme.spacing.unit,
    // marginLeft: theme.spacing.unit * 2,
    // marginRight: theme.spacing.unit * 2,
    // transition: theme.transitions.create(['opacity']),
    // [theme.breakpoints.down('sm')]: {
    //   backgroundColor: theme.bg.white,
    //   position: 'absolute',
    //   width: 'calc(100% - 118px)',
    //   zIndex: -1,
    //   left: 0,
    //   visibility: 'hidden',
    //   opacity: 0,
    //   margin: 0,
    //   '&.active': {
    //     visibility: 'visible',
    //     opacity: 1,
    //     zIndex: 3
    //   }
    // }
  },
  searchItem: {
    '& em': {
      fontStyle: 'normal',
      color: theme.palette.primary.main
    }
  },
  searchItemHighlighted: {
    backgroundColor: theme.color.grey2,
    cursor: 'pointer'
  },
  textfield: {
    backgroundColor: theme.color.white,
    margin: 0,
    flex: 1,
    minHeight: 'initial',
    '& input:focus': {
      outline: '1px dotted #606469'
    }
  },
  enhancedSelectWrapper: {
    margin: '0 auto',
    width: '100%s',
    maxHeight: 500,
    '& .input': {
      maxWidth: '100%',
      '& > div': {
        marginRight: 0
      }
    },
    [theme.breakpoints.up('md')]: {
      width: 500
    }
  }
});

/* Need to override the default RS filtering; otherwise entities whose label
 * doesn't match the search term will be automatically filtered, meaning that
 * searching by tag won't work. */
const filterResults = (option: Item, inputValue: string) => {
  return true;
};

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

interface State {
  inputValue: string;
}

type CombinedProps = AlgoliaProps &
  WithStyles<ClassNames> &
  WithTheme &
  RouteComponentProps<{}>;
class AlgoliaSearchBar extends React.Component<CombinedProps, State> {
  searchIndex: any = null;
  mounted: boolean = false;
  isMobile: boolean = false;
  state: State = {
    inputValue: ''
  };

  componentDidMount() {
    const { theme } = this.props;
    this.mounted = true;
    if (theme) {
      this.isMobile = windowIsNarrowerThan(theme.breakpoints.values.sm);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getOptionsFromResults = () => {
    const [docs, community] = this.props.searchResults;
    const { inputValue } = this.state;
    const options = [...docs, ...community];
    return [
      ...options,
      { value: 'search', label: inputValue, data: { source: 'finalLink' } }
    ];
  };

  onInputValueChange = (inputValue: string) => {
    if (!this.mounted) {
      return;
    }
    this.setState({ inputValue });
    this.props.searchAlgolia(inputValue);
  };

  getLinkTarget = (inputValue: string) => {
    return inputValue
      ? `/support/search/?query=${inputValue}`
      : '/support/search/';
  };

  handleSelect = (selected: Item) => {
    if (!selected) {
      return;
    }
    const { history } = this.props;
    const { inputValue } = this.state;
    const href = pathOr('', ['data', 'href'], selected);
    if (selected.value === 'search') {
      const link = this.getLinkTarget(inputValue);
      history.push(link);
    } else {
      window.open(href, '_blank');
    }
  };

  handleSubmit = () => {
    const { inputValue } = this.state;
    const { history } = this.props;
    const link = this.getLinkTarget(inputValue);
    history.push(link);
  };

  render() {
    const { classes, searchEnabled, searchError } = this.props;
    const { inputValue } = this.state;
    const options = this.getOptionsFromResults();

    return (
      <React.Fragment>
        {searchError && (
          <Notice error spacingTop={8} spacingBottom={0}>
            {searchError}
          </Notice>
        )}
        <div className={classes.root}>
          <Search className={''} data-qa-search-icon />
          <EnhancedSelect
            disabled={!searchEnabled}
            isMulti={false}
            isClearable={false}
            inputValue={inputValue}
            options={options}
            components={{ Option: SearchItem }}
            onChange={this.handleSelect}
            onInputChange={this.onInputValueChange}
            placeholder="Search for answers..."
            className={classes.enhancedSelectWrapper}
            styleOverrides={selectStyles}
            filterOption={filterResults}
            value={false}
          />
        </div>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });
const search = withSearch({ hitsPerPage: 10, highlight: true });

export default compose<CombinedProps, {}>(
  styled,
  search,
  withRouter
)(AlgoliaSearchBar);

import Search from '@material-ui/icons/Search';
import * as classNames from 'classnames';
import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
  WithTheme
} from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect';
import Notice from 'src/components/Notice';
import { selectStyles } from 'src/features/TopMenu/SearchBar';
import { COMPACT_SPACING_UNIT } from 'src/themeFactory';
import windowIsNarrowerThan from 'src/utilities/breakpoints';
import withSearch, { AlgoliaState as AlgoliaProps } from '../SearchHOC';
import SearchItem from './SearchItem';

type ClassNames =
  | 'root'
  | 'searchIcon'
  | 'searchItem'
  | 'searchItemHighlighted'
  | 'enhancedSelectWrapper'
  | 'textfield'
  | 'searchIconCompact'
  | 'enhancedSelectWrapperCompact';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      position: 'relative'
    },
    searchItem: {
      '& em': {
        fontStyle: 'normal',
        color: theme.palette.primary.main
      }
    },
    searchIcon: {
      position: 'absolute',
      color: theme.color.grey1,
      zIndex: 3,
      bottom: 12,
      left: 5
    },
    searchIconCompact: {
      top: 8,
      left: 1
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
      width: 300,
      maxHeight: 500,
      '& .react-select__value-container': {
        paddingLeft: theme.spacing(4)
      },
      '& .input': {
        maxWidth: '100%',
        '& p': {
          paddingLeft: theme.spacing(3),
          color: theme.color.grey1
        },
        '& > div': {
          marginRight: 0
        }
      },
      [theme.breakpoints.up('md')]: {
        width: 500
      }
    },
    enhancedSelectWrapperCompact: {
      '& .input': {
        '& p': {
          paddingLeft: theme.spacing(4)
        }
      },
      '& .react-select__input': {
        paddingLeft: 10
      }
    }
  });

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
      { value: 'search', label: inputValue, data: { source: 'finalLink' } },
      ...options
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

  handleSelect = (selected: Item<string>) => {
    if (!selected) {
      return;
    }
    const { history } = this.props;
    const { inputValue } = this.state;
    if (!inputValue) {
      return;
    }
    const href = pathOr('', ['data', 'href'], selected);
    if (selected.value === 'search') {
      const link = this.getLinkTarget(inputValue);
      history.push(link);
    } else {
      window.open(href, '_blank', 'noopener');
    }
  };

  handleSubmit = () => {
    const { inputValue } = this.state;
    if (!inputValue) {
      return;
    }
    const { history } = this.props;
    const link = this.getLinkTarget(inputValue);
    history.push(link);
  };

  render() {
    const { classes, searchEnabled, searchError, theme } = this.props;
    const { inputValue } = this.state;
    const options = this.getOptionsFromResults();
    const spacingMode =
      theme.spacing() === COMPACT_SPACING_UNIT ? 'compact' : 'normal';
    return (
      <React.Fragment>
        {searchError && (
          <Notice error spacingTop={8} spacingBottom={0}>
            {searchError}
          </Notice>
        )}
        <div className={classes.root}>
          <Search
            className={classNames({
              [classes.searchIcon]: true,
              [classes.searchIconCompact]: spacingMode === 'compact'
            })}
            data-qa-search-icon
          />
          <EnhancedSelect
            disabled={!searchEnabled}
            isMulti={false}
            isClearable={false}
            inputValue={inputValue}
            options={options}
            components={
              { Option: SearchItem, DropdownIndicator: () => null } as any
            }
            onChange={this.handleSelect}
            onInputChange={this.onInputValueChange}
            placeholder="Search for answers..."
            className={classNames({
              [classes.enhancedSelectWrapper]: true,
              [classes.enhancedSelectWrapperCompact]: spacingMode === 'compact'
            })}
            styles={selectStyles}
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

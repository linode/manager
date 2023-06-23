import Search from '@mui/icons-material/Search';
import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { createStyles, withStyles, WithStyles, WithTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect';
import { Notice } from 'src/components/Notice/Notice';
import { selectStyles } from 'src/features/TopMenu/SearchBar';
import windowIsNarrowerThan from 'src/utilities/breakpoints';
import withSearch, { AlgoliaState as AlgoliaProps } from '../SearchHOC';
import SearchItem from './SearchItem';

type ClassNames =
  | 'root'
  | 'searchIcon'
  | 'searchItem'
  | 'enhancedSelectWrapper'
  | 'notice';

const styles = (theme: Theme) =>
  createStyles({
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
    searchItem: {
      '& em': {
        color: theme.palette.primary.main,
        fontStyle: 'normal',
      },
    },
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
    inputValue: '',
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
      { data: { source: 'finalLink' }, label: inputValue, value: 'search' },
      ...options,
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
    const { classes, searchEnabled, searchError } = this.props;
    const { inputValue } = this.state;
    const options = this.getOptionsFromResults();

    return (
      <React.Fragment>
        {searchError && (
          <Notice error spacingTop={8} className={classes.notice}>
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
              { DropdownIndicator: () => null, Option: SearchItem } as any
            }
            onChange={this.handleSelect}
            onInputChange={this.onInputValueChange}
            placeholder="Search for answers..."
            label="Search for answers"
            hideLabel
            className={classes.enhancedSelectWrapper}
            styles={selectStyles}
          />
        </div>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });
const search = withSearch({ highlight: true, hitsPerPage: 10 });

export default compose<CombinedProps, {}>(
  styled,
  search,
  withRouter
)(AlgoliaSearchBar);

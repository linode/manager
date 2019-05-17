import { compose, concat, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles,
  WithTheme
} from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect';
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
  root: {},
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

interface State {
  value: string;
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
    value: '',
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

  getDataFromOptions = () => {
    const { inputValue } = this.state;
    const [docs, community] = this.props.searchResults;
    const options = [...docs, ...community];
    return concat(options, [
      { value: 'search', label: inputValue, data: { source: 'finalLink' } }
    ]);
  };

  onInputValueChange = (inputValue: string) => {
    if (!this.mounted) {
      return;
    }
    this.setState({ inputValue });
    this.props.searchAlgolia(inputValue);
  };

  renderOptionsHelper = (
    item: Item,
    currentIndex: number,
    highlighted: boolean,
    itemProps: any
  ) => {
    const { classes } = this.props;
    return (
      <div
        key={currentIndex}
        {...itemProps}
        className={`${classes.searchItem} ${highlighted &&
          classes.searchItemHighlighted}`}
      >
        <SearchItem item={item} highlighted={highlighted} />
      </div>
    );
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
    const { inputValue, value } = this.state;
    const data = this.getDataFromOptions();

    return (
      <React.Fragment>
        {searchError && (
          <Notice error spacingTop={8} spacingBottom={0}>
            {searchError}
          </Notice>
        )}
        <EnhancedSelect
          disabled={!searchEnabled}
          options={data}
          value={value}
          inputValue={inputValue}
          renderItems={this.renderOptionsHelper}
          onInputValueChange={this.onInputValueChange}
          onSubmit={this.handleSubmit}
          handleSelect={this.handleSelect}
          placeholder="Search for answers..."
          noFilter
          search
          className={classes.enhancedSelectWrapper}
          maxHeight={500}
        />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });
const search = withSearch({ hitsPerPage: 10, highlight: true });

export default compose<any, any, any, any>(
  styled,
  search,
  withRouter
)(AlgoliaSearchBar);

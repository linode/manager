import * as Algolia from 'algoliasearch';
import { compose, concat, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import {
  StyleRulesCallback,
  
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import EnhancedSelect, { Item } from 'src/components/EnhancedSelect';
import Notice from 'src/components/Notice';
import { ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_KEY, DOCS_BASE_URL } from 'src/constants';
import windowIsNarrowerThan from 'src/utilities/breakpoints';

import SearchItem from './SearchItem';

type ClassNames = 'root'
  | 'searchItem'
  | 'searchItemHighlighted'
  | 'enhancedSelectWrapper'
  | 'textfield';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  searchItem: {
    '& em': {
      fontStyle: 'normal',
      color: theme.palette.primary.main,
    }
  },
  searchItemHighlighted: {
    backgroundColor: theme.color.grey2,
    cursor: 'pointer',
  },
  textfield: {
    backgroundColor: theme.color.white,
    margin: 0,
    flex: 1,
    minHeight: 'initial',
    '& input:focus': {
      outline: '1px dotted #606469',
    },
  },
  enhancedSelectWrapper: {
    margin: '0 auto',
    width: '100%s',
    maxHeight: 500,
    '& [class*="formControl"]': {
      maxWidth: '100%',
      '& > div': {
        marginRight: 0,
      },
    },
    [theme.breakpoints.up('md')]: {
      width: 500,
    },
  },
});

interface State {
  enabled: boolean;
  value: string;
  inputValue: string;
  options: Item[];
  error?: string; 
}

type index = 'linode-docs';

type CombinedProps = WithStyles<ClassNames> & RouteComponentProps<{}>;

class AlgoliaSearchBar extends React.Component<CombinedProps, State> {
  searchIndex: any = null;
  mounted: boolean = false;
  isMobile: boolean = false;
  state: State = {
    enabled: true,
    value: '',
    inputValue: '',
    options: [],
  };

  componentDidMount() {
    const { theme } = this.props;
    this.mounted = true;
    if (theme) {
      this.isMobile = windowIsNarrowerThan(theme.breakpoints.values.sm);
    }
    // initialize Algolia API Client
    try {
      const client = Algolia(ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_KEY);
      const idx: index = 'linode-docs';
      this.searchIndex = client.initIndex(idx);
    }
    catch {
      // Credentials were incorrect or couldn't be found;
      // Disable the search functionality in the component.
      this.setState({ enabled: false, error: "Search could not be enabled." });
      return;
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getDataFromOptions = () => {
    const { options, inputValue } = this.state;
    return concat(options,[{value: 'search', label: inputValue, data: { source: 'finalLink'}}]);
  }

  searchAlgolia = (inputValue:string) => {
    if (!this.mounted) { return; }
    if (!inputValue) { 
      this.setState({ options: [] }); 
      return; 
    }
    if (!this.searchIndex) {
      this.setState({ options: [], error: "Search could not be enabled."});
      return;
    }
    this.searchIndex.search({
      query: inputValue,
      hitsPerPage: this.isMobile ? 5 : 20,
    }, this.searchSuccess);
  }

  searchSuccess = (err:any, content:any) => {
    if (!this.mounted) { return; }
    if (err) {
      /*
      * Errors from Algolia have the format: {'message':string, 'code':number}
      * We do not want to push these messages on to the user as they are not under
      * our control and can be account-related (e.g. "You have exceeded your quota").
      */
      this.setState({ error: "There was an error retrieving your search results." });
      return;
    }
    const options = this.convertHitsToItems(content.hits);
    this.setState({ options, error: undefined });
  }

  convertHitsToItems = (hits:any) : Item[] => {
    if (!hits) { return []; }
    return hits.map((hit:any, idx:number) => {
      return { value: idx, label: hit._highlightResult.title.value, data: {
        source: 'Linode documentation',
        href: DOCS_BASE_URL + hit.href,
      } }
    })
  }

  onInputValueChange = (inputValue:string) => {
    if (!this.mounted) { return; }
    this.setState({ inputValue });
    this.searchAlgolia(inputValue);
  }

  renderOptionsHelper = (item:Item, currentIndex:number, highlighted:boolean, itemProps:any) => {
    const { classes } = this.props;
    return (
    <div key={currentIndex} {...itemProps} className={`${classes.searchItem} ${highlighted && classes.searchItemHighlighted}`} >
      <SearchItem item={item} highlighted={highlighted}  />
    </div>
    )
  }

  getLinkTarget = (inputValue:string) => {
    return inputValue
      ? `/support/search/?query=${inputValue}`
      : '/support/search/'
  }

  handleSelect = (selected:Item) => {
    if (!selected) { return; }
    const { history } = this.props;
    const { inputValue } = this.state;
    const href = pathOr('', ['data', 'href'], selected)
    if (selected.value === 'search') {
      const link = this.getLinkTarget(inputValue);
      history.push(link)
    } else {
      window.open(href,'_blank');
    }
  }

  handleSubmit = () => {
    const { inputValue } = this.state;
    const { history } = this.props;
    const link = this.getLinkTarget(inputValue);
    history.push(link);
  }

  render() {
    const { classes } = this.props;
    const { enabled, error, inputValue, value } = this.state;
    const data = this.getDataFromOptions();

    return (
      <React.Fragment>
      {error && <Notice error spacingTop={8} spacingBottom={0} >{error}</Notice>}
        <EnhancedSelect
          disabled={!enabled}
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

export default compose<any,any,any>(
  styled,
  withRouter)(AlgoliaSearchBar);

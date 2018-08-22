import * as Algolia from 'algoliasearch';
import { compose, concat, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import EnhancedSelect, { Item } from 'src/components/EnhancedSelect';
import Notice from 'src/components/Notice';
import { ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_KEY, DOCS_BASE_URL } from 'src/constants';

import SearchItem from './SearchItem';

type ClassNames = 'root'
  | 'searchItem'
  | 'searchItemHighlighted'
  | 'enhancedSelectWrapper'
  | 'textfield';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
  searchItem: {
    '& em': {
      fontStyle: 'normal',
      color: theme.palette.primary.main,
    }
  },
  searchItemHighlighted: {
    backgroundColor: theme.palette.primary.main,
    cursor: 'pointer',
    '& div, & span': {
      color: 'white',
    },
    '& em': {
      color: theme.color.black,
    }
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
    },
    [theme.breakpoints.up('md')]: {
      width: 500,
    },
  },
});

interface Props {}

interface State {
  value: string;
  inputValue: string;
  options: Item[];
  error?: string; 
}

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

// Algolia API Client
const client = Algolia(ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_KEY);
const searchIndex = client.initIndex('linode-docs');

class AlgoliaSearchBar extends React.Component<CombinedProps, State> {
  state: State = {
    value: '',
    inputValue: '',
    options: [],
  };

  getDataFromOptions = () => {
    const { options, inputValue } = this.state;
    return concat(options,[{value: 'search', label: inputValue, data: { source: 'finalLink'}}]);
  }

  searchAlgolia = (inputValue:string) => {
    if (!inputValue) { this.setState({ options: [] }); }
    searchIndex.search({
      query: inputValue,
      hitsPerPage: 5,
    }, this.searchSuccess);
  }

  searchSuccess = (err:any, content:any) => {
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
    this.setState({ inputValue });
    this.searchAlgolia(inputValue);
  }

  renderOptionsHelper = (item:Item, index:number, highlighted:boolean, itemProps:any) => {
    const { classes } = this.props;
    return (
    <div key={index} {...itemProps} className={`${classes.searchItem} ${highlighted && classes.searchItemHighlighted}`} >
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
      window.open(href,'_newtab');
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
    const { error, inputValue, value } = this.state;
    const data = this.getDataFromOptions();

    return (
      <React.Fragment>
      {error && <Notice error spacingTop={8} spacingBottom={0} >{error}</Notice>}
        <EnhancedSelect
          options={data}
          value={value}
          inputValue={inputValue}
          renderItems={this.renderOptionsHelper}
          onInputValueChange={this.onInputValueChange}
          onSubmit={this.handleSubmit}
          handleSelect={this.handleSelect}
          placeholder="Search Linode Docs and Community questions"
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

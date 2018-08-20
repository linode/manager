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
import Typography from '@material-ui/core/Typography';

import EnhancedSelect, { Item } from 'src/components/EnhancedSelect';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_KEY, DOCS_BASE_URL } from 'src/constants';

import SearchItem from './SearchItem';

type ClassNames = 'root'
  | 'searchBox'
  | 'searchHeading'
  | 'searchField'
  | 'searchItem'
  | 'searchItemHighlighted'
  | 'input'
  | 'textfield';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  searchBox: {
    backgroundColor: theme.color.grey2,
    marginLeft: theme.spacing.unit,
    marginRight: '-6px',
  },
  searchHeading: {
    color: theme.color.black,
    marginBottom: theme.spacing.unit * 2,
    fontSize: '175%',
  },
  searchField: {
    padding: theme.spacing.unit * 3,
    width: '100%',
  },
  searchItem: {
    height: '24px',
    boxSizing: 'content-box',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '.9rem',
    transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color .2s cubic-bezier(0.4, 0, 0.2, 1)',
    fontWeight: 400,
    fontFamily: 'Lato, sans-serif',
    lineHeight: '1.2em',
    whiteSpace: 'initial',
    padding: '12px',
    width: 'auto',
    display: 'flex',
    position: 'relative',
    textAlign: 'left',
    alignItems: 'center',
    justifyContent: 'flex-start',
    textDecoration: 'none',
    '& em': {
      fontStyle: 'normal',
      color: '#3683DC',
    }
  },
  searchItemHighlighted: {
    backgroundColor: theme.color.grey1,
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
  input: {
    border: 0,
    width: '100%',
    background: 'transparent',
    '& input': {
      transition: theme.transitions.create(['opacity']),
      fontSize: '1.0em',
      [theme.breakpoints.down('sm')]: {},
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
    searchIndex.search({
      query: inputValue,
      hitsPerPage: 10,
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

  handleSelect = (selected:Item) => {
    if (!selected) { return; }
    const { history } = this.props;
    const { inputValue } = this.state;
    const href = pathOr('', ['data', 'href'], selected)
    if (selected.value === 'search') {
      const link = inputValue
        ? `/support/search/?query=${inputValue}`
        : '/support/search/'
      history.push(link)
    } else {
      window.open(href,'_newtab');
    }
  }

  render() {
    const { classes } = this.props;
    const { error, inputValue, value } = this.state;
    const data = this.getDataFromOptions();

    return (
      <React.Fragment>
      {error && <Notice error spacingTop={8} spacingBottom={0} >{error}</Notice>}
        <EnhancedSelect
          className={classes.input}
          options={data}
          value={value}
          inputValue={inputValue}
          renderItems={this.renderOptionsHelper}
          onInputValueChange={this.onInputValueChange}
          handleSelect={this.handleSelect}
          placeholder="Search Linode Docs and Community questions"
          noFilter
          search
        />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any,any,any>(
  styled,
  withRouter)(AlgoliaSearchBar);

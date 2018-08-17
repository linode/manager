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
import Grid from 'src/components/Grid';
import { ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_KEY, DOCS_BASE_URL } from 'src/constants';

import SearchItem from './SearchItem';

type ClassNames = 'root'
  | 'bgIcon'
  | 'searchHeading'
  | 'input'
  | 'textfield';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    padding: theme.spacing.unit * 4,
    maxWidth: '100%',
    backgroundColor: theme.color.green,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bgIcon: {
    color: '#04994D',
    width: 250,
    height: 250,
    '& .circle': {
      fill: 'transparent',
    },
    '& .outerCircle': {
      stroke: 'transparent',
    },
    '& .insidePath path': {
      stroke: '#04994D',
    },
  },
  searchHeading: {
    textAlign: 'center',
    color: theme.color.white,
    position: 'relative',
    zIndex: 2,
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
}

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

// Algolia API Client
const client = Algolia(ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_KEY);
const searchIndex = client.initIndex('linode-docs');

class SearchPanel extends React.Component<CombinedProps, State> {
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
      // @todo handle error
      console.log(err);
    }
    const options = this.convertHitsToItems(content.hits);
    this.setState({ options });
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

  renderOptionsHelper = (item:Item, index:number, highlighted:boolean, itemProps:any, classes:any) => {
    return (
    <div key={index} {...itemProps} className={classes} >
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
    const { inputValue, value } = this.state;
    const data = this.getDataFromOptions();

    return (
      <Grid container className={classes.root}>
        <Grid item xs={12} >
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
          />
        </Grid>
      </Grid>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any,any,any>(
  styled,
  withRouter)(SearchPanel);

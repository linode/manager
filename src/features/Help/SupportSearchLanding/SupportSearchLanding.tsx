import * as Algolia from 'algoliasearch';
import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import Search from '@material-ui/icons/Search';

import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import { ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_KEY, DOCS_BASE_URL, DOCS_SEARCH_URL } from 'src/constants';
import { parseQueryParams } from 'src/utilities/queryParams';

import DocumentationResults, { SearchResult } from './DocumentationResults';
import HelpResources from './HelpResources';

type ClassNames = 'root'
  | 'backButton'
  | 'searchBar'
  | 'searchBoxInner'
  | 'searchHeading'
  | 'searchField';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  backButton: {
    margin: '2px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
  },
  searchBar: {
    maxWidth: '100%',
  },
  searchBoxInner: {
    padding: theme.spacing.unit * 3,
    backgroundColor: theme.color.grey2,
    marginTop: 0,
  },
  searchHeading: {
    color: theme.color.black,
    marginBottom: theme.spacing.unit * 2,
    fontSize: '175%',
  },
  searchField: {
    padding: theme.spacing.unit * 3,
  },
});

interface Props {}

interface State {
  error?: string;
  query: string;
  results: SearchResult[];
}

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

// Algolia API Client
const client = Algolia(ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_KEY);
const searchIndex = client.initIndex('linode-docs');

class SupportSearchLanding extends React.Component<CombinedProps, State> {
  state: State = {
    query: '',
    results: [],
  }

  componentDidMount() {
    const queryFromParams = parseQueryParams(this.props.location.search)['?query'];
    const query = queryFromParams ? queryFromParams : '';
    this.setState({ query });
    this.searchAlgolia(query);
  }

  onInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ query: e.target.value });
    this.searchAlgolia(e.target.value);
  }

  onBackButtonClick = () => {
    const { history } = this.props;
    history.push('/support');
  }

  searchAlgolia = (inputValue:string) => {
    if (!inputValue) { 
      this.setState({ results: [] });
      return;
    }
    searchIndex.search({
      query: inputValue,
      hitsPerPage: 3,
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
    const results  = this.convertHitsToItems(content.hits);
    this.setState({ results, error: undefined });
  }

  convertHitsToItems = (hits:any) => {
    if (!hits) { return []; }
    return hits.map((hit:any, idx:number) => {
      return { value: idx, label: hit.title, data: {
        source: 'Linode documentation',
        href: DOCS_BASE_URL + hit.href,
      } }
    })
  }

  render() {
    const { classes } = this.props;
    const { query, results } = this.state;

    return (
      <Grid container direction="column">
        <Grid item>
          <Grid container alignItems="center">
            <Grid item>
              <IconButton
                onClick={this.onBackButtonClick}
                className={classes.backButton}
              >
                <KeyboardArrowLeft />
              </IconButton>
            </Grid>
            <Grid item>
              <Typography variant="headline" >
                {query ? `Search results for "${query}"` : "Search"} 
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <TextField
            className={classes.searchBoxInner}
            placeholder="Search Linode documentation and community questions"
            value={query}
            onChange={this.onInputChange}
            InputProps={{
              className: classes.searchBar,
              startAdornment:
                <InputAdornment position="end">
                  <Search />
                </InputAdornment>
            }}
          />
        </Grid>
        <Grid item>
          <DocumentationResults sectionTitle="Documentation" results={results} target={DOCS_SEARCH_URL + query} />
        </Grid>
        {/* Blocked until Community Site implements Algolia indexing */}
        {/* <Grid item>
          <DocumentationResults sectionTitle="Community Posts" results={[]} target="google.com" />
        </Grid> */}
        <Grid container item>
          <HelpResources />
        </Grid>
      </Grid>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any,any,any>(
  styled,
  withRouter)(SupportSearchLanding);
import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import {
  StyleRulesCallback,

  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import Search from '@material-ui/icons/Search';

import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { COMMUNITY_SEARCH_URL, DOCS_SEARCH_URL } from 'src/constants';
import { parseQueryParams } from 'src/utilities/queryParams';

import withSearch, { AlgoliaState as AlgoliaProps } from '../SearchHOC';
import DocumentationResults, { SearchResult } from './DocumentationResults';
import HelpResources from './HelpResources';

type ClassNames = 'root'
  | 'backButton'
  | 'searchBar'
  | 'searchBoxInner'
  | 'searchHeading'
  | 'searchField'
  | 'searchIcon';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
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
    '& > div': {
      maxWidth: '100%',
    },
  },
  searchHeading: {
    color: theme.color.black,
    marginBottom: theme.spacing.unit * 2,
    fontSize: '175%',
  },
  searchField: {
    padding: theme.spacing.unit * 3,
  },
  searchIcon: {
    marginRight: 0,
    '& svg': {
      color: theme.palette.text.primary,
    }
  },
});

interface State {
  query: string;
}

type CombinedProps = AlgoliaProps & WithStyles<ClassNames> & RouteComponentProps<{}>;

class SupportSearchLanding extends React.Component<CombinedProps, State> {
  searchIndex:any = null;
  state: State = {
    query: '',
  }

  componentDidMount() {
    this.searchFromParams();
  }

  searchFromParams() {
    const queryFromParams = parseQueryParams(this.props.location.search)['?query'];
    const query = queryFromParams ? decodeURIComponent(queryFromParams) : '';
    this.setState({ query });
    this.props.searchAlgolia(query);
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    if (!prevProps.searchEnabled && this.props.searchEnabled) {
      this.searchFromParams();
    }
  }

  onInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ query: e.target.value });
    this.props.searchAlgolia(e.target.value);
  }

  onBackButtonClick = () => {
    const { history } = this.props;
    history.push('/support');
  }

  render() {
    const { classes, searchEnabled, searchError, searchResults } = this.props;
    const { query } = this.state;

    const [docs, community] = searchResults;

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
                {query.length > 1 ? `Search results for "${query}"` : "Search"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          {searchError && <Notice error>{searchError}</Notice>}
          <TextField
            className={classes.searchBoxInner}
            placeholder="Search Linode documentation and community questions"
            value={query}
            onChange={this.onInputChange}
            disabled={!Boolean(searchEnabled)}
            InputProps={{
              className: classes.searchBar,
              startAdornment:
                <InputAdornment position="end" className={classes.searchIcon}>
                  <Search />
                </InputAdornment>
            }}
          />
        </Grid>
        <Grid item>
          <DocumentationResults sectionTitle="Documentation" results={docs as SearchResult[]} target={DOCS_SEARCH_URL + query} />
        </Grid>
        <Grid item>
          <DocumentationResults sectionTitle="Community Posts" results={community as SearchResult[]} target={COMMUNITY_SEARCH_URL + query} />
        </Grid>
        <Grid container item>
          <HelpResources />
        </Grid>
      </Grid>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });
const searchable = withSearch({hitsPerPage: 5, highlight: false});

export default compose<any,any,any,any>(
  styled,
  searchable,
  withRouter)(SupportSearchLanding);
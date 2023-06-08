import Search from '@mui/icons-material/Search';
import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import InputAdornment from 'src/components/core/InputAdornment';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import { H1Header } from 'src/components/H1Header/H1Header';
import { Notice } from 'src/components/Notice/Notice';
import TextField from 'src/components/TextField';
import { COMMUNITY_SEARCH_URL, DOCS_SEARCH_URL } from 'src/constants';
import { getQueryParam } from 'src/utilities/queryParams';
import withSearch, { AlgoliaState as AlgoliaProps } from '../SearchHOC';
import { DocumentationResults, SearchResult } from './DocumentationResults';
import HelpResources from './HelpResources';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  searchBar: {
    maxWidth: '100%',
  },
  searchBoxInner: {
    padding: theme.spacing(3),
    backgroundColor: theme.color.grey2,
    marginTop: 0,
    '& > div': {
      maxWidth: '100%',
    },
  },
  searchIcon: {
    marginRight: 0,
    '& svg': {
      color: theme.palette.text.primary,
    },
  },
}));

export type CombinedProps = AlgoliaProps & RouteComponentProps<{}>;

export const SupportSearchLanding = (props: CombinedProps) => {
  const { classes } = useStyles();
  const { searchEnabled, searchError, searchResults } = props;
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    setQuery(getQueryParam(props.location.search, 'query'));
    props.searchAlgolia(query);
  }, [props, query]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value ?? '');
    props.history.replace({ search: `?query=${query}` });
    props.searchAlgolia(query);
  };

  const [docs, community] = searchResults;

  return (
    <Grid container direction="column">
      <Box
        sx={{
          marginBottom: '16px',
        }}
      >
        <H1Header
          title={query.length > 1 ? `Search results for "${query}"` : 'Search'}
          data-qa-support-search-landing-title
        />
      </Box>
      <Box>
        {searchError && <Notice error>{searchError}</Notice>}
        <TextField
          data-qa-search-landing-input
          className={classes.searchBoxInner}
          placeholder="Search Linode documentation and community questions"
          label="Search Linode documentation and community questions"
          hideLabel
          value={query}
          onChange={onInputChange}
          disabled={!Boolean(searchEnabled)}
          InputProps={{
            className: classes.searchBar,
            startAdornment: (
              <InputAdornment position="end" className={classes.searchIcon}>
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box>
        <DocumentationResults
          sectionTitle="Documentation"
          results={docs as SearchResult[]}
          target={DOCS_SEARCH_URL + query}
        />
      </Box>
      <Box>
        <DocumentationResults
          sectionTitle="Community Posts"
          results={community as SearchResult[]}
          target={COMMUNITY_SEARCH_URL + query}
        />
      </Box>
      <HelpResources />
    </Grid>
  );
};

const searchable = withSearch({ hitsPerPage: 5, highlight: false });
const enhanced: any = compose(searchable, withRouter)(SupportSearchLanding);

export default enhanced;

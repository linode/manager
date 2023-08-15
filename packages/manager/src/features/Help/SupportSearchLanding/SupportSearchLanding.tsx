import Search from '@mui/icons-material/Search';
import { Box } from 'src/components/Box';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { H1Header } from 'src/components/H1Header/H1Header';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { InputAdornment } from 'src/components/InputAdornment';
import { COMMUNITY_SEARCH_URL, DOCS_SEARCH_URL } from 'src/constants';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';

import withSearch, { AlgoliaState as AlgoliaProps } from '../SearchHOC';
import { DocumentationResults, SearchResult } from './DocumentationResults';
import HelpResources from './HelpResources';

const useStyles = makeStyles()((theme: Theme) => ({
  searchBar: {
    maxWidth: '100%',
  },
  searchBoxInner: {
    '& > div': {
      maxWidth: '100%',
    },
    backgroundColor: theme.color.grey2,
    marginTop: 0,
    padding: theme.spacing(3),
  },
  searchIcon: {
    '& svg': {
      color: theme.palette.text.primary,
    },
    marginRight: 0,
  },
}));

export type CombinedProps = AlgoliaProps & RouteComponentProps<{}>;

const SupportSearchLanding = (props: CombinedProps) => {
  const {
    history,
    searchAlgolia,
    searchEnabled,
    searchError,
    searchResults,
  } = props;
  const [docs, community] = searchResults;
  const { classes } = useStyles();

  const [queryString, setQueryString] = React.useState('');

  React.useEffect(() => {
    searchFromParams();
  }, []);

  const searchFromParams = () => {
    const query = getQueryParamFromQueryString(location.search, 'query');
    setQueryString(query);
    searchAlgolia(query);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value ?? '';
    setQueryString(newQuery);
    history.replace({ search: `?query=${newQuery}` });
    searchAlgolia(newQuery);
  };

  return (
    <Grid container data-testid="support-search-landing" direction="column">
      <Box
        sx={{
          marginBottom: '16px',
        }}
      >
        <H1Header
          title={
            queryString.length > 1
              ? `Search results for "${queryString}"`
              : 'Search'
          }
          data-qa-support-search-landing-title
          dataQaEl={queryString}
        />
      </Box>
      <Box>
        {searchError && <Notice variant="error">{searchError}</Notice>}
        <TextField
          InputProps={{
            className: classes.searchBar,
            startAdornment: (
              <InputAdornment className={classes.searchIcon} position="end">
                <Search />
              </InputAdornment>
            ),
          }}
          className={classes.searchBoxInner}
          data-qa-search-landing-input
          disabled={!Boolean(searchEnabled)}
          hideLabel
          label="Search Linode documentation and community questions"
          onChange={onInputChange}
          placeholder="Search Linode documentation and community questions"
          value={queryString}
        />
      </Box>
      <Box>
        <DocumentationResults
          results={docs as SearchResult[]}
          sectionTitle="Documentation"
          target={DOCS_SEARCH_URL + queryString}
        />
      </Box>
      <Box>
        <DocumentationResults
          results={community as SearchResult[]}
          sectionTitle="Community Posts"
          target={COMMUNITY_SEARCH_URL + queryString}
        />
      </Box>
      <HelpResources />
    </Grid>
  );
};

export default withSearch({ highlight: false, hitsPerPage: 5 })(
  withRouter(SupportSearchLanding)
);

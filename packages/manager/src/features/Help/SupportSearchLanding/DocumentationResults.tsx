import OpenInNew from '@mui/icons-material/OpenInNew';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import ExternalLink from 'src/components/ExternalLink';
import { Typography } from 'src/components/Typography';
import ListItem from 'src/components/core/ListItem';
import Paper from 'src/components/core/Paper';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  icon: {
    color: '#3683DC',
    fontSize: '0.8rem',
    marginLeft: theme.spacing(1),
  },
  label: {
    color: '#3683DC',
  },
  link: {
    fontFamily: theme.font.bold,
    marginTop: theme.spacing(2),
  },
  noResultsContainer: {
    padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
  },
  searchItem: {
    '&:hover': {
      backgroundColor: theme.bg.offWhite,
    },
    backgroundColor: theme.color.white,
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: 'initial',
  },
}));

export interface SearchResult {
  data: {
    href: string;
    source: string;
  };
  label: string;
}

interface Props {
  results: SearchResult[];
  sectionTitle: string;
  target: string;
}

type CombinedProps = Props;

const DocumentationResults: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { results, sectionTitle, target } = props;

  const renderResults = () => {
    return results.map((result: SearchResult, idx: number) => (
      <ListItem
        className={classes.searchItem}
        component="a"
        key={idx}
        onClick={() => window.open(result.data.href, '_newtab')}
        role="menuitem"
        tabIndex={0}
      >
        <Typography
          className={classes.label}
          data-qa-search-result
          variant="body1"
        >
          {result.label}
          <OpenInNew className={classes.icon} />
        </Typography>
      </ListItem>
    ));
  };

  const renderEmptyState = () => {
    return (
      <Paper className={classes.noResultsContainer}>
        <Typography variant="body1">No results</Typography>
      </Paper>
    );
  };

  return (
    <>
      <Typography
        className={classes.header}
        data-qa-results={sectionTitle}
        variant="h2"
      >
        Most Relevant {sectionTitle}
      </Typography>
      <Paper>
        <nav>{results.length > 0 ? renderResults() : renderEmptyState()}</nav>
      </Paper>
      <ExternalLink
        className={classes.link}
        data-qa-view-more={sectionTitle}
        link={target}
        text={`View more ${sectionTitle}`}
      />
    </>
  );
};

export default DocumentationResults;

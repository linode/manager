import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import ListItem from 'src/components/core/ListItem';

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
    display: 'inline-block',
    fontFamily: theme.font.bold,
    marginTop: theme.spacing(2),
  },
  noResultsContainer: {
    padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
  },
  searchItem: {
    '&:last-child': {
      borderBottom: 0,
    },
    backgroundColor: theme.color.white,
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontSize: '0.9rem',
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
        role="menuitem"
        tabIndex={0}
      >
        <Link to={result.data.href}>{result.label}</Link>
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
      <Link
        className={classes.link}
        data-qa-view-more={sectionTitle}
        to={target}
      >{`View more ${sectionTitle}`}</Link>
    </>
  );
};

export default DocumentationResults;

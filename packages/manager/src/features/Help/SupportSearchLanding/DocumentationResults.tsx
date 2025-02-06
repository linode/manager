import { ListItem, Paper, Typography } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';

import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  header: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  icon: {
    color: theme.tokens.color.Ultramarine[70],
    fontSize: '0.8rem',
    marginLeft: theme.spacing(1),
  },
  label: {
    color: theme.tokens.color.Ultramarine[70],
  },
  link: {
    display: 'inline-block',
    font: theme.font.bold,
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

export const DocumentationResults = (props: Props) => {
  const { classes } = useStyles();
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

  const renderEmptyState = (): JSX.Element => {
    return (
      <Paper className={classes.noResultsContainer}>
        <Typography
          data-testid="data-qa-documentation-no-results"
          variant="body1"
        >
          No results
        </Typography>
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

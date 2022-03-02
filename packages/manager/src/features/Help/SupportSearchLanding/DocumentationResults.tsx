import OpenInNew from '@material-ui/icons/OpenInNew';
import * as React from 'react';
import ListItem from 'src/components/core/ListItem';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';

const useStyles = makeStyles((theme: Theme) => ({
  noResultsContainer: {
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
  },
  icon: {
    color: '#3683DC',
    fontSize: '0.8rem',
    marginLeft: theme.spacing(1),
  },
  header: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  label: {
    color: '#3683DC',
  },
  link: {
    marginTop: theme.spacing(2),
    fontFamily: theme.font.bold,
  },
  searchItem: {
    position: 'initial',
    backgroundColor: theme.color.white,
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      backgroundColor: theme.bg.offWhite,
    },
  },
}));

export interface SearchResult {
  data: {
    source: string;
    href: string;
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
        key={idx}
        role="menuitem"
        component="a"
        onClick={() => window.open(result.data.href, '_newtab')}
        tabIndex={0}
      >
        <Typography
          variant="body1"
          className={classes.label}
          data-qa-search-result
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
        variant="h2"
        className={classes.header}
        data-qa-results={sectionTitle}
      >
        Most Relevant {sectionTitle}
      </Typography>
      <Paper>
        <nav>{results.length > 0 ? renderResults() : renderEmptyState()}</nav>
      </Paper>
      <ExternalLink
        link={target}
        text={`View more ${sectionTitle}`}
        data-qa-view-more={sectionTitle}
        className={classes.link}
      />
    </>
  );
};

export default DocumentationResults;

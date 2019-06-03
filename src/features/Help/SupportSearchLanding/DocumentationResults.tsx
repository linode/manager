import { WithStyles } from '@material-ui/core/styles';
import OpenInNew from '@material-ui/icons/OpenInNew';
import * as React from 'react';
import ListItem from 'src/components/core/ListItem';
import Paper from 'src/components/core/Paper';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames =
  | 'root'
  | 'resultsContainer'
  | 'noResultsContainer'
  | 'moreResults'
  | 'icon'
  | 'header'
  | 'label'
  | 'link'
  | 'searchItem';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    resultsContainer: {
      '& em': {
        fontStyle: 'normal'
      }
    },
    noResultsContainer: {
      padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`
    },
    moreResults: {
      fontSize: '1rem',
      fontWeight: 'bold',
      marginTop: theme.spacing(2)
    },
    icon: {
      color: '#3683DC',
      fontSize: '0.8rem',
      marginLeft: theme.spacing(1)
    },
    header: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2)
    },
    label: {
      color: '#3683DC'
    },
    link: {
      display: 'inline-block'
    },
    searchItem: {
      position: 'initial',
      backgroundColor: theme.color.white,
      borderBottom: `1px solid ${theme.palette.divider}`,
      '&:hover': {
        backgroundColor: theme.bg.offWhite
      }
    }
  });

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

type CombinedProps = Props & WithStyles<ClassNames>;

const DocumentationResults: React.StatelessComponent<CombinedProps> = props => {
  const { classes, results, sectionTitle, target } = props;
  const renderResults = () => {
    return results.map((result: SearchResult, idx: number) => (
      <ListItem
        className={classes.searchItem}
        key={idx}
        role="menuitem"
        component="a"
        onClick={() => window.open(result.data.href, '_newtab')}
        tabIndex={1}
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
    <div className={classes.root}>
      <Typography
        variant="h1"
        className={classes.header}
        data-qa-results={sectionTitle}
      >
        {`Most Relevant ${sectionTitle}`}
      </Typography>
      <Paper>
        <nav role="menu">
          {results.length > 0 ? renderResults() : renderEmptyState()}
        </nav>
      </Paper>
      <Typography variant="body2" className={classes.moreResults}>
        <a
          href={target}
          className={classes.link}
          data-qa-view-more={sectionTitle}
        >
          View more {sectionTitle}
        </a>
      </Typography>
    </div>
  );
};

export default withStyles(styles)(DocumentationResults);

import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import OpenInNew from '@material-ui/icons/OpenInNew';

import Table from 'src/components/Table';

import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import Grid from 'src/components/Grid';

type ClassNames = 'root'
  | 'resultsContainer'
  | 'moreResults'
  | 'icon'
  | 'header'
  | 'label'
  | 'link'
  | 'searchItem';

const styles: StyleRulesCallback<ClassNames> = (theme: Linode.Theme) => {
  // const { palette: { status } } = theme;
  return {
    root: {
      height: '20em',
      margin: theme.spacing.unit * 2,
    },
    resultsContainer: {
      maxWidth: '100%',
      height: '11em',
      '& em': {
        fontStyle: 'normal',
      },
    },
    moreResults: {
      fontSize: '1rem',
      fontWeight: 'bold',
      marginTop: theme.spacing.unit * 3,
    },
    icon: {
      color: '#3683DC',
      fontSize: '0.8rem',
      marginLeft: theme.spacing.unit,
    },
    header: {
      marginBottom: theme.spacing.unit * 2,
    },
    label: {
      color: '#3683DC',
    },
    link: {
      display: 'inline-block',
    },
    searchItem: {
      backgroundColor: theme.color.white,
      '&:hover': {
        backgroundColor: theme.color.grey2,
      }
    },
  }
};

export interface SearchResult {
  data: {
    source: string;
    href: string;
  }
  label: string;
}

interface Props {
  results: SearchResult[];
  sectionTitle: string;
  target: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DocumentationResults: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, results, sectionTitle, target } = props;
  const renderResults = () => {
    return results.map((result:SearchResult, idx:number) =>
      <TableRow key={idx} className={classes.searchItem}>
        <TableCell onClick={() => window.open(result.data.href, '_newtab')}>
          <Typography variant="body1" className={classes.label} >
            {result.label}
            <OpenInNew className={classes.icon} />
          </Typography>
        </TableCell>
      </TableRow>
    )
  }

  const renderEmptyState = () => {
    return(
      <TableRow >
        <TableCell>
          <Typography variant="body1">No results</Typography>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <Grid container alignItems="flex-start" direction="column" className={classes.root}>
      <Grid item>
        <Typography variant="headline" className={classes.header}>
          { `Most Relevant ${sectionTitle}` }
        </Typography>
      </Grid>
      <Table className={classes.resultsContainer}>
        <TableBody>
          {results.length > 0 ? renderResults() : renderEmptyState()}
        </TableBody>
      </Table>
      <Grid item>
        <Typography variant="body2" className={classes.moreResults}>
         <a href={target} className={classes.link} >View more {sectionTitle}</a>
        </Typography>
      </Grid>
    </Grid>
  )
}

export default withStyles(styles, { withTheme: true })(DocumentationResults);
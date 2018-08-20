import * as Algolia from 'algoliasearch';
import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';

import AlgoliaSearchBar from './AlgoliaSearchBar';

type ClassNames = 'root'
  | 'searchBox'
  | 'searchHeading'
  | 'searchField'
  | 'input'
  | 'textfield';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  searchBox: {
    backgroundColor: theme.color.grey2,
    marginLeft: theme.spacing.unit,
    marginRight: '-6px',
  },
  searchHeading: {
    color: theme.color.black,
    marginBottom: theme.spacing.unit * 2,
    fontSize: '175%',
  },
  searchField: {
    padding: theme.spacing.unit * 3,
    width: '100%',
  },
  textfield: {
    backgroundColor: theme.color.white,
    margin: 0,
    flex: 1,
    minHeight: 'initial',
    '& input:focus': {
      outline: '1px dotted #606469',
    },
  },
  input: {
    border: 0,
    width: '100%',
    background: 'transparent',
    '& input': {
      transition: theme.transitions.create(['opacity']),
      fontSize: '1.0em',
      [theme.breakpoints.down('sm')]: {},
    },
  },
});

interface Props {}

interface State {
  error?: string; 
}

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

class SearchPanel extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    const { classes } = this.props;
    return (
      <Grid container justify='flex-start' className={classes.root}>
        <Grid item>
          <Typography variant='headline' className={classes.searchHeading} >
              Get Help
          </Typography>
        </Grid>
        <Grid item container xs={12} className={classes.searchBox} >
          <Grid item className={classes.searchField}>
            <Typography variant='headline' >
                What can we help you with?
            </Typography>
            <AlgoliaSearchBar />
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any,any,any>(
  styled,
  withRouter)(SearchPanel);

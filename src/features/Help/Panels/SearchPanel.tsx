import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import AlgoliaSearchBar from './AlgoliaSearchBar';

type ClassNames = 'root'
  | 'searchHeading';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing.unit * 2,
    }
  },
  searchHeading: {
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
  },
});

type CombinedProps = WithStyles<ClassNames>;

class SearchPanel extends React.Component<CombinedProps, {}> {
  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Paper
          className={classes.root}
        >
          <Typography
            variant="h1"
            className={classes.searchHeading}
            data-qa-search-heading
          >
            What can we help you with?
        </Typography>
        <AlgoliaSearchBar />
        </Paper>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(SearchPanel);


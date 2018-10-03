import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import {
  StyleRulesCallback,
  
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import LinodeIcon from 'src/assets/addnewmenu/linode.svg';

import AlgoliaSearchBar from './AlgoliaSearchBar';

type ClassNames = 'root'
  | 'bgIcon'
  | 'searchHeading';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 4,
    backgroundColor: theme.color.green,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing.unit * 8,
    }
  },
  bgIcon: {
    color: '#04994D',
    position: 'absolute',
    left: 0,
    width: 250,
    height: 250,
    '& .circle': {
      fill: 'transparent',
    },
    '& .outerCircle': {
      stroke: 'transparent',
    },
    '& .insidePath path': {
      stroke: '#04994D',
    },
  },
  searchHeading: {
    textAlign: 'center',
    color: theme.color.white,
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
          <LinodeIcon className={classes.bgIcon} />
          <Typography
            variant="headline"
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

const styled = withStyles(styles, { withTheme: true });

export default styled(SearchPanel);


import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import LinodeIcon from 'src/assets/addnewmenu/linode.svg';

import AlgoliaSearchBar from './AlgoliaSearchBar';

type ClassNames = 'root'
  | 'bgIcon'
  | 'searchHeading';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    padding: theme.spacing.unit * 10,
    backgroundColor: theme.color.green,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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

interface Props {}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

class SearchPanel extends React.Component<CombinedProps, State> {
  state: State = {};

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
          >
            Ways to Get Help
        </Typography>
        <AlgoliaSearchBar />
        </Paper>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SearchPanel);
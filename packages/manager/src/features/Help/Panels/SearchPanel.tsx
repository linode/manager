import * as React from 'react';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
  WithTheme,
} from 'src/components/core/styles';
import H1Header from 'src/components/H1Header';
import AlgoliaSearchBar from './AlgoliaSearchBar';

type ClassNames = 'root' | 'bgIcon' | 'searchHeading';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(4),
      backgroundColor: theme.color.green,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      [theme.breakpoints.up('md')]: {
        padding: theme.spacing(8),
      },
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
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    searchHeading: {
      textAlign: 'center',
      color: theme.color.white,
      position: 'relative',
      zIndex: 2,
    },
  });

type CombinedProps = WithStyles<ClassNames> & WithTheme;

class SearchPanel extends React.Component<CombinedProps, {}> {
  render() {
    const { classes } = this.props;

    return (
      <Paper className={classes.root}>
        <LinodeIcon className={classes.bgIcon} />
        <H1Header
          title="What can we help you with?"
          className={classes.searchHeading}
          data-qa-search-heading
        />
        <AlgoliaSearchBar />
      </Paper>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SearchPanel);

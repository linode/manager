import * as classNames from 'classnames';
import * as React from 'react';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import Breadcrumb from 'src/components/Breadcrumb';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
  WithTheme
} from 'src/components/core/styles';
import { COMPACT_SPACING_UNIT } from 'src/themeFactory';
import AlgoliaSearchBar from './AlgoliaSearchBar';

type ClassNames = 'root' | 'bgIcon' | 'searchHeading' | 'bgIconCompact';

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
        padding: theme.spacing(8)
      }
    },
    bgIcon: {
      color: '#04994D',
      position: 'absolute',
      left: 0,
      width: 250,
      height: 250,
      '& .circle': {
        fill: 'transparent'
      },
      '& .outerCircle': {
        stroke: 'transparent'
      },
      '& .insidePath path': {
        stroke: '#04994D'
      },
      [theme.breakpoints.down('xs')]: {
        display: 'none'
      }
    },
    bgIconCompact: {
      [theme.breakpoints.up('sm')]: {
        width: 150,
        height: 150
      },
      [theme.breakpoints.up('lg')]: {
        width: 200,
        height: 200
      }
    },
    searchHeading: {
      textAlign: 'center',
      color: theme.color.white,
      position: 'relative',
      zIndex: 2
    }
  });

type CombinedProps = WithStyles<ClassNames> & WithTheme;

class SearchPanel extends React.Component<CombinedProps, {}> {
  render() {
    const { classes, theme } = this.props;
    const spacingMode =
      theme.spacing() === COMPACT_SPACING_UNIT ? 'compact' : 'normal';
    return (
      <React.Fragment>
        <Paper className={classes.root}>
          <LinodeIcon
            className={classNames({
              [classes.bgIcon]: true,
              [classes.bgIconCompact]: spacingMode === 'compact'
            })}
          />
          <Breadcrumb
            pathname={''}
            labelTitle="What can we help you with?"
            className={classes.searchHeading}
            data-qa-search-heading
          />
          <AlgoliaSearchBar />
        </Paper>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SearchPanel);

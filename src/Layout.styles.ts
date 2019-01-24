import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'appFrame' | 'content' | 'wrapper' | 'grid' | 'switchWrapper';

export type StyleProps = WithStyles<ClassNames>;

const styles: StyleRulesCallback = theme => ({
  appFrame: {
    position: 'relative',
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
    backgroundColor: theme.bg.main
  },
  content: {
    flex: 1,
    [theme.breakpoints.up('md')]: {
      marginLeft: 215
    },
    [theme.breakpoints.up('xl')]: {
      marginLeft: 275
    }
  },
  wrapper: {
    padding: theme.spacing.unit * 3,
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing.unit * 2,
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2
    }
  },
  grid: {
    [theme.breakpoints.up('lg')]: {
      height: '100%'
    }
  },
  switchWrapper: {
    flex: 1,
    maxWidth: '100%',
    position: 'relative',
    '&.mlMain': {
      [theme.breakpoints.up('lg')]: {
        maxWidth: '78.8%'
      }
    }
  }
});

export default withStyles(styles);

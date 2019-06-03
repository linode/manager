import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'ellipses' | 'ellipsesInner';

const styles = (theme: Theme) =>
  createStyles({
  ellipses: {
    padding: theme.spacing(1),
    color: theme.color.black,
    backgroundColor: theme.bg.white,
    border: '1px solid ' + `${theme.color.borderPagination}`,
    borderRight: 0,
    [theme.breakpoints.only('xs')]: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
      minWidth: 27,
      height: 30,
      minHeight: 30
    },
    [theme.breakpoints.up('sm')]: {
      display: 'inline-block',
      textAlign: 'center',
      minWidth: 40,
      height: 40
    }
  },
  ellipsesInner: {
    fontSize: '1.2rem',
    position: 'relative',
    top: -5,
    lineHeight: 0,
    [theme.breakpoints.up('sm')]: {
      top: 0
    }
  }
});

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);

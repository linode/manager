import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'ellipses' | 'ellipsesInner';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  ellipses: {
    display: 'inline-flex',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    padding: theme.spacing.unit,
    color: theme.color.black,
    [theme.breakpoints.up('sm')]: {
      display: 'inline-block',
      textAlign: 'center',
      backgroundColor: theme.bg.white,
      border: '1px solid ' + `${theme.color.borderPagination}`,
      minWidth: 40,
      height: 40,
    },
  },
  ellipsesInner: {
    fontSize: '1.2rem',
    position: 'relative',
    top: 0,
    lineHeight: 0,
  },
});

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);
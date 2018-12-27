import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'ellipses';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  ellipses: {
    margin: theme.spacing.unit * 2,
    [theme.breakpoints.down('xs')]: {
      margin: 5,
    }
  }
});

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);

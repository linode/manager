import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'ellipses';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  ellipses: {
    margin: theme.spacing.unit * 2
  }
});

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);

import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    marginbottom: theme.spacing.unit * 2,
  },
});

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);

import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'ellipses';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  ellipses: {
    backgroundColor: theme.bg.offWhiteDT,
    border: '1px solid ' + `${theme.color.borderPagination}`,
    padding: theme.spacing.unit,
    minWidth: 40,
    height: 40,
    // [theme.breakpoints.down('xs')]: {
    //   margin: 5,
    // }
  }
});

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);

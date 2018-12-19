import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

type ClassNames = 'title' | 'tagGroup';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  title: {
    flex: 1
  },
  tagGroup: {
    flexDirection: 'row-reverse'
  },
});

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);

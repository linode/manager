import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'title' | 'tagGroup' | 'CSVlinkContainer' | 'CSVlink';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  title: {
    flex: 1
  },
  tagGroup: {
    flexDirection: 'row-reverse'
  },
  CSVlink: {
    fontSize: '.9rem',
    color: theme.palette.text.primary,
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  CSVlinkContainer: {
    marginTop: theme.spacing.unit
  }
});

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);

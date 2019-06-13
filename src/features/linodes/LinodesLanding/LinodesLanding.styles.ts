import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'title' | 'tagGroup' | 'CSVlinkContainer' | 'CSVlink';

const styles = (theme: Theme) =>
  createStyles({
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
      marginTop: theme.spacing(1)
    }
  });

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);

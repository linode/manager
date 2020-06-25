import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames =
  | 'title'
  | 'tagGroup'
  | 'CSVlinkContainer'
  | 'CSVlink'
  | 'addNewLink'
  | 'chip'
  | 'chipRunning'
  | 'chipPending'
  | 'chipOffline';

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
    },
    addNewLink: {
      marginBottom: -3,
      marginLeft: 15
    },
    chip: {
      color: '#fff',
      fontSize: '1.1rem',
      padding: 10
    },
    chipRunning: {
      backgroundColor: '#00b159'
    },
    chipPending: {
      backgroundColor: '#ffb31a'
    },
    chipOffline: {
      backgroundColor: '#9ea4ae'
    }
  });

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);

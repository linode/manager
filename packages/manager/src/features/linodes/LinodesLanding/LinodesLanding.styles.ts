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
  | 'chipOffline'
  | 'controlHeader'
  | 'toggleButton';

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
    },
    controlHeader: {
      backgroundColor: '#f9fafa',
      marginBottom: 20,
      display: 'flex',
      justifyContent: 'flex-end'
    },
    toggleButton: {
      padding: 10,
      '&:focus': {
        // Browser default until we get styling direction for focus states
        outline: '1px dotted #999'
      }
    }
  });

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);

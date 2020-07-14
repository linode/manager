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
      backgroundColor: '#f7f7f8',
      color: '#5d646f',
      fontSize: '1.1rem',
      fontFamily: theme.font.bold,
      padding: 10,
      '&:before': {
        display: 'inline-block',
        borderRadius: '50%',
        content: '""',
        height: 16,
        width: 16,
        minWidth: 16,
        marginRight: 8
      }
    },
    chipRunning: {
      '&:before': {
        backgroundColor: '#00b159'
      }
    },
    chipPending: {
      '&:before': {
        backgroundColor: '#ffb31a'
      }
    },
    chipOffline: {
      '&:before': {
        backgroundColor: '#dbdde1'
      }
    },
    controlHeader: {
      backgroundColor: theme.bg.controlHeader,
      marginBottom: 28,
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

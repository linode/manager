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
  | 'chipActive'
  | 'chipRunning'
  | 'chipPending'
  | 'chipOffline'
  | 'controlHeader'
  | 'toggleButton'
  | 'clearFilters';

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
      ...theme.applyStatusPillStyles
    },
    chipActive: {
      backgroundColor: '#CECECE'
    },
    chipRunning: {
      '&:before': {
        backgroundColor: theme.color.green
      }
    },
    chipPending: {
      '&:before': {
        backgroundColor: theme.color.orange
      }
    },
    chipOffline: {
      '&:before': {
        backgroundColor: theme.color.grey10
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
    },
    clearFilters: {
      margin: 0,
      padding: 0,
      '&:hover': {
        '& svg': {
          color: `${theme.palette.primary.main} !important`
        }
      }
    }
  });

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);

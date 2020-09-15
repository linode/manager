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
  | 'clearFilters'
  | 'cmrSpacing'
  | 'cmrCSVlink';

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
      ...theme.applyStatusPillStyles,
      '&:hover, &:focus, &:active': {
        backgroundColor: theme.bg.chipActive
      }
    },
    chipActive: {
      backgroundColor: theme.bg.chipActive
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
    clearFilters: {
      margin: '1px 0 0 0',
      padding: 0,
      '&:hover': {
        '& svg': {
          color: `${theme.palette.primary.main} !important`
        }
      }
    },
    cmrSpacing: {
      margin: 0,
      width: '100%',
      '& > .MuiGrid-item': {
        paddingLeft: 0,
        paddingRight: 0
      }
    },
    cmrCSVlink: {
      [theme.breakpoints.down('md')]: {
        marginRight: theme.spacing()
      }
    }
  });

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';

type ClassNames =
  | 'root'
  | 'title'
  | 'tagGroup'
  | 'CSVlinkContainer'
  | 'CSVlink'
  | 'CSVwrapper'
  | 'addNewLink'
  | 'chipContainer'
  | 'chip'
  | 'chipActive'
  | 'chipRunning'
  | 'chipPending'
  | 'chipOffline'
  | 'clearFilters';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      width: '100%',
      '& > .MuiGrid-item': {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    title: {
      flex: 1,
    },
    tagGroup: {
      flexDirection: 'row-reverse',
    },
    CSVlink: {
      color: theme.cmrTextColors.tableHeader,
      fontSize: '.9rem',
      '&:hover': {
        textDecoration: 'underline',
      },
      [theme.breakpoints.down('sm')]: {
        marginRight: theme.spacing(),
      },
    },
    CSVlinkContainer: {
      marginTop: theme.spacing(0.5),
      '&.MuiGrid-item': {
        paddingRight: 0,
      },
    },
    CSVwrapper: {
      marginLeft: 0,
      marginRight: 0,
      width: '100%',
    },
    addNewLink: {
      marginBottom: -3,
      marginLeft: 15,
    },
    chipContainer: {
      display: 'flex',
      flexDirection: 'row',
    },
    chip: {
      ...theme.applyStatusPillStyles,
      marginRight: theme.spacing(3),
      paddingTop: '0px !important',
      paddingBottom: '0px !important',
      transition: 'none',
      '& .MuiChip-label': {
        marginBottom: 2,
      },
    },
    chipActive: {
      backgroundColor: theme.bg.chipActive,
    },
    chipRunning: {
      '&:before': {
        backgroundColor: theme.cmrIconColors.iGreen,
      },
    },
    chipPending: {
      '&:before': {
        backgroundColor: theme.cmrIconColors.iOrange,
      },
    },
    chipOffline: {
      '&:before': {
        backgroundColor: theme.cmrIconColors.iGrey,
      },
    },
    clearFilters: {
      margin: '1px 0 0 0',
      padding: 0,
      '&:hover': {
        '& svg': {
          color: `${theme.palette.primary.main} !important`,
        },
      },
    },
  });

export type StyleProps = WithStyles<ClassNames>;

export default withStyles(styles);

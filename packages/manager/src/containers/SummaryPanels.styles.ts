import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles } from '@mui/styles';

type ClassNames =
  | 'region'
  | 'regionInner'
  | 'root'
  | 'section'
  | 'summarySection'
  | 'title'
  | 'volumeLink';

export type StyleProps = WithStyles<ClassNames>;

const summaryPanelStyles = (theme: Theme) =>
  createStyles({
    region: {
      [theme.breakpoints.between('sm', 'lg')]: {
        display: 'flex',
        flexBasis: '100%',
        maxWidth: '100%',
      },
    },
    regionInner: {
      [theme.breakpoints.only('xs')]: {
        padding: '0 8px !important',
      },
      [theme.breakpoints.up('lg')]: {
        '&:first-of-type': {
          padding: '8px 8px 0 8px !important',
        },
        '&:last-of-type': {
          padding: '0 8px !important',
        },
      },
    },
    root: {
      [theme.breakpoints.up('lg')]: {
        padding: theme.spacing(1),
        paddingRight: 0,
      },
      [theme.breakpoints.up('md')]: {
        paddingLeft: theme.spacing(1),
        paddingTop: 0,
      },
    },
    section: {
      marginBottom: theme.spacing(1),
      ...theme.typography.body1,
      '& .dif': {
        '& .MuiChip-root': {
          position: 'absolute',
          right: -10,
          top: '-4px',
        },
        position: 'relative',
        width: 'auto',
      },
    },
    summarySection: {
      height: '93%',
      marginBottom: theme.spacing(2),
      minHeight: '160px',
      padding: theme.spacing(2.5),
    },
    title: {
      marginBottom: theme.spacing(2),
    },
    volumeLink: {
      '&:hover, &:focus': {
        textDecoration: 'underline',
      },
      color: theme.palette.primary.main,
      fontSize: '1rem',
    },
  });

export default summaryPanelStyles;

import { WithStyles } from '@material-ui/core/styles';

import { createStyles, Theme, withStyles } from 'src/components/core/styles';

type ClassNames =
  | 'region'
  | 'volumeLink'
  | 'regionInner'
  | 'root'
  | 'title'
  | 'summarySection'
  | 'section';

export type StyleProps = WithStyles<ClassNames>;

const styles = (theme: Theme) =>
  createStyles({
    region: {
      [theme.breakpoints.between('sm', 'md')]: {
        flexBasis: '100%',
        maxWidth: '100%',
        display: 'flex'
      }
    },
    regionInner: {
      [theme.breakpoints.only('xs')]: {
        padding: '0 8px !important'
      },
      [theme.breakpoints.up('lg')]: {
        '&:first-of-type': {
          padding: '8px 8px 0 8px !important'
        },
        '&:last-of-type': {
          padding: '0 8px !important'
        }
      }
    },
    volumeLink: {
      color: theme.palette.primary.main,
      fontSize: '1rem',
      '&:hover, &:focus': {
        textDecoration: 'underline'
      }
    },
    root: {
      [theme.breakpoints.up('md')]: {
        paddingLeft: theme.spacing(1),
        paddingTop: theme.spacing(1)
      },
      [theme.breakpoints.up('lg')]: {
        padding: theme.spacing(1),
        paddingRight: 0
      }
    },
    title: {
      marginBottom: theme.spacing(2)
    },
    summarySection: {
      padding: theme.spacing(2),
      marginBottom: theme.spacing(3)
    },
    section: {
      marginBottom: theme.spacing(1),
      ...theme.typography.body1,
      '& .dif': {
        position: 'relative',
        width: 'auto',
        '& .chip': {
          position: 'absolute',
          top: '-4px',
          right: -10
        }
      }
    },
    main: {},
    sidebar: {},
    domainSidebar: {},
    titleWrapper: {}
  });

export default withStyles(styles);

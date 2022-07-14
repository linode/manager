import { createStyles, Theme, WithStyles } from 'src/components/core/styles';

export type ClassNames =
  | 'wrapper'
  | 'container'
  | 'root'
  | 'toggleButton'
  | 'legend'
  | 'legendIcon'
  | 'red'
  | 'yellow'
  | 'blue'
  | 'green'
  | 'text'
  | 'tableHead'
  | 'tableHeadInner'
  | 'simpleLegend'
  | 'simpleLegendRoot'
  | 'crossedOut'
  | 'chartIcon';

export type StyleProps = WithStyles<ClassNames>;

const newMetricDisplayStyles = (theme: Theme) =>
  createStyles({
    wrapper: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      '& > div': {
        flexBasis: '100%',
      },
    },
    container: {
      borderTop: `1px solid ${theme.borderColors.divider}`,
      color: '#777',
      fontSize: '0.875rem',
      marginTop: theme.spacing(0.5),
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(),
      paddingTop: theme.spacing(0.5),
    },
    root: {
      maxWidth: 600,
      width: '85%',
      '& *': {
        height: 'auto',
        border: 'none',
        backgroundColor: 'transparent',
        tableLayout: 'fixed',
      },
      '& th, td': {
        padding: `${theme.spacing(0.5)}px !important`,
      },
      '& td:first-child': {
        backgroundColor: 'transparent !important',
        [theme.breakpoints.down('sm')]: {
          marginLeft: -45,
        },
      },
      '& .data': {
        minWidth: 100,
      },
      [theme.breakpoints.down('lg')]: {
        '& th, & td': {
          padding: '4px !important',
        },
      },
      [theme.breakpoints.down('md')]: {
        width: '100%',
      },
      [theme.breakpoints.down('sm')]: {
        maxWidth: '100%',
        '& table': {
          display: 'flex',
        },
        '& td': {
          justifyContent: 'normal',
          minHeight: 'auto',
        },
        '& tbody': {
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        },
        '& tr': {
          flexBasis: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      },
    },
    tableHead: {
      backgroundColor: theme.bg.offWhite,
      '& tr > th': {
        backgroundColor: theme.bg.offWhite,
      },
      [theme.breakpoints.down('sm')]: {
        display: 'block !important',
        '& tr': {
          display: 'flex',
          flexDirection: 'column',
          marginTop: theme.spacing(5.25),
          marginBottom: theme.spacing(5.25),
          marginRight: theme.spacing(2),
          '&:last-of-type': {
            marginBottom: 0,
          },
        },
      },
    },
    tableHeadInner: {
      width: '23%',
      '& p': {
        color: theme.textColors.tableHeader,
      },
      [theme.breakpoints.down('md')]: {
        width: '20%',
      },
    },
    toggleButton: {
      justifyContent: 'flex-start',
      color: theme.color.headline,
      fontFamily: theme.font.normal,
      fontSize: '0.75rem',
      margin: 0,
      marginLeft: -2,
      padding: 0,
      '&:focus': {
        outline: `1px dotted #ccc`,
      },
      '&:hover': {
        backgroundColor: 'transparent',
        color: theme.color.headline,
      },
    },
    legend: {
      [theme.breakpoints.up('md')]: {
        width: '38%',
      },
    },
    legendIcon: {
      width: 18,
      height: 18,
      marginRight: theme.spacing(1),
      borderWidth: 1,
      borderStyle: 'solid',
    },
    text: {
      color: theme.color.black,
      fontSize: '0.75rem',
    },
    simpleLegendRoot: {
      maxWidth: 'initial',
      display: 'flex',
    },
    simpleLegend: {
      width: 'auto',
      marginTop: theme.spacing(2),
    },
    crossedOut: {
      textDecoration: 'line-through',
      backgroundColor: 'transparent !important',
    },
    chartIcon: {
      display: 'inline-block',
      position: 'relative',
      left: 4,
      top: 4,
    },
  });

export default newMetricDisplayStyles;

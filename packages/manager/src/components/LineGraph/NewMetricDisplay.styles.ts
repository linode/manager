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
      margin: `${theme.spacing(2)}px ${theme.spacing(1)}px ${theme.spacing(
        1
      )}px`,
      padding: 10,
      color: '#777',
      backgroundColor: theme.bg.offWhiteDT,
      border: `1px solid ${theme.color.border3}`,
      fontSize: 14,
    },
    root: {
      maxWidth: 600,
      '& *': {
        height: 'auto',
        border: 'none',
        backgroundColor: 'transparent',
      },
      '& td:first-child': {
        backgroundColor: 'transparent !important',
        [theme.breakpoints.down('sm')]: {
          marginLeft: -50,
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
      [theme.breakpoints.down('sm')]: {
        maxWidth: '100%',
        '& table': {
          display: 'flex',
        },
        '& td': {
          justifyContent: 'normal',
          minHeight: 'auto',
        },
        '& tr:not(:first-child) td': {
          '&:first-child': {
            marginTop: theme.spacing(2),
          },
        },
      },
      [theme.breakpoints.only('sm')]: {
        '& tbody': {
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        },
        '& tr': {
          flexBasis: '100%',
        },
      },
    },
    tableHead: {
      [theme.breakpoints.down('sm')]: {
        display: 'block !important',
        '& tr': {
          display: 'flex',
          flexDirection: 'column',
          marginTop: 26,
          marginBottom: 42,
          marginRight: theme.spacing(2),
          '&:last-of-type': {
            marginBottom: 0,
          },
        },
      },
    },
    tableHeadInner: {
      paddingBottom: 4,
    },
    toggleButton: {
      padding: 0,
      margin: 0,
      justifyContent: 'flex-start',
      fontFamily: theme.font.normal,
      fontSize: 14,
      '&:focus': {
        outline: `1px dotted #ccc`,
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

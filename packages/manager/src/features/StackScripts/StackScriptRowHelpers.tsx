import { createStyles, Theme } from 'src/components/core/styles';

export type ClassNames =
  | 'row'
  | 'link'
  | 'libRadio'
  | 'libRadioLabel'
  | 'libTitle'
  | 'libDescription'
  | 'selectionGrid'
  | 'selectionGridDetails'
  | 'selectionGridButton'
  | 'stackScriptCell'
  | 'stackScriptUsername'
  | 'detailsButton'
  | 'images';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const styles = (theme: Theme) =>
  createStyles({
    row: {
      height: 44,
    },
    link: {
      color: theme.cmrTextColors.tableStatic,
    },
    libRadio: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      height: '100%',
      width: 70,
    },
    libRadioLabel: {
      cursor: 'pointer',
    },
    libTitle: {
      fontSize: '0.875rem',
      lineHeight: '1.125rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      [theme.breakpoints.down('sm')]: {
        wordBreak: 'break-all',
      },
    },
    libDescription: {
      color: theme.cmrTextColors.tableHeader,
      fontSize: '.75rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      [theme.breakpoints.between('sm', 'lg')]: {
        wordBreak: 'break-word',
      },
    },
    selectionGrid: {
      flexWrap: 'nowrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
    selectionGridDetails: {
      [theme.breakpoints.down('xs')]: {
        '&.MuiGrid-item': {
          marginTop: 4,
          paddingBottom: 0,
        },
      },
    },
    selectionGridButton: {
      [theme.breakpoints.down('xs')]: {
        '&.MuiGrid-item': {
          paddingTop: 0,
          paddingLeft: 0,
        },
      },
    },
    stackScriptCell: {
      padding: 0,
      width: '100%',
    },
    stackScriptUsername: {
      color: theme.cmrTextColors.tableStatic,
      fontSize: '0.875rem',
      lineHeight: '1.125rem',
    },
    detailsButton: {
      fontSize: '0.875rem',
      fontFamily: theme.font.normal,
      marginTop: 0,
      padding: theme.spacing(),
      width: 100,
      '&:hover, &:focus': {
        backgroundColor: 'transparent',
      },
      [theme.breakpoints.down('xs')]: {
        marginBottom: 4,
        marginLeft: 0,
        paddingTop: 4,
        paddingBottom: 4,
      },
    },
    images: {
      fontSize: '0.75rem',
      overflowWrap: 'break-word',
      whiteSpace: 'pre-wrap',
    },
  });
